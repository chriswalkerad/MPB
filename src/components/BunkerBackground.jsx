import { useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, GodRays, Noise } from '@react-three/postprocessing'
import { BlendFunction, KernelSize, Resizer } from 'postprocessing'
import { gsap } from 'gsap'
import {
  forwardRef,
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import * as THREE from 'three'

/* ----------- PARTICLES SHADER ------------ */

const particlesVert = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;
uniform float uParticleVelocity;
uniform float uParticleDisplaceFactor;

attribute float aScale;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    /* Add noise movement */
    float noiseX = snoise(vec2(position.x, uTime * uParticleVelocity)) * uParticleDisplaceFactor;
    float noiseY = snoise(vec2(position.y, uTime * uParticleVelocity)) * uParticleDisplaceFactor;
    float noiseZ = snoise(vec2(position.z, uTime * uParticleVelocity)) * uParticleDisplaceFactor;

    modelPosition = vec4(
      modelPosition.x + noiseX,
      modelPosition.y + noiseY,
      modelPosition.z + noiseZ,
      modelPosition.w
    );

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    gl_PointSize = uSize * aScale * uPixelRatio;
    gl_PointSize *= (1.0 / - viewPosition.z);
}
`

const particlesFrag = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;

void main()
{
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
  float strength = min(0.05 / distanceToCenter - 0.1, uAlpha);

  gl_FragColor = vec4(uColor, strength);
}
`

/* Configuration */
const config = {
  modelSrc: 'bunker.glb',
  camera: {
    position: new THREE.Vector3(0.7507294368005816, -2, 8.688852630592953),
    rotation: new THREE.Euler(
      0.3679671281735305,
      0.06208526103691726,
      -0.023915566989092085
    ),
    fov: 10,
    rotationMultiplier: {
      x: 0.001,
      y: 0.001
    }
  }
}

/* Default control values (replacing leva/useReproducibleControls) */
const defaultControls = {
  fogColor: '#000',
  fogNear: 8.8,
  fogFar: 9.6,
  ambientLightIntensity: 0.8,
  uSize: 25,
  uColor: '#fff',
  uAlpha: 0.25,
  uParticleVelocity: 0.1,
  uParticleDisplaceFactor: 0.5,
  noise: true,
  noiseOpacity: 0.75,
  sunColor: '#ff0000',
  sunPosition: [-0.1, -0.15, -0.45]
}

/* BunkerModel Component */
const BunkerModel = (props) => {
  const scene = useThree((s) => s.scene)
  const { nodes, materials } = useGLTF('/models/bunker.glb')

  useLayoutEffect(() => {
    if (materials.Mat_in) {
      materials.Mat_in.fog = false
    }
  }, [materials.Mat_in, scene])

  if (!nodes || !materials) {
    return null
  }

  return (
    <group {...props} dispose={null}>
      {nodes.EDF && (
        <mesh
          geometry={nodes.EDF.geometry}
          material={materials.Mat_Edf}
          position={[6.00127506, 16.34449387, 4.43831062]}
          rotation={[Math.PI / 2, -1.2e-7, -Math.PI / 2]}
          scale={0.01}
        />
      )}
      {nodes.IN && (
        <mesh
          geometry={nodes.IN.geometry}
          material={materials.Mat_in}
          position={[6.00127506, 16.34449387, 4.43831062]}
          rotation={[Math.PI / 2, -1.2e-7, -Math.PI / 2]}
          scale={0.01}
        />
      )}
    </group>
  )
}

/* Sun Component for GodRays */
const Sun = forwardRef(function Sun(props, forwardRef) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    ref.current.visible = false

    const timeline = gsap.timeline()
    timeline
      .to({}, { duration: 2.5 })
      .call(() => {
        if (ref.current) ref.current.visible = true
      })
      .to({}, { duration: 0.05 })
      .call(() => {
        if (ref.current) ref.current.visible = false
      })
      .to({}, { duration: 0.05 })
      .call(() => {
        if (ref.current) ref.current.visible = true
      })
      .to({}, { duration: 0.05 })
      .call(() => {
        if (ref.current) ref.current.visible = false
      })
      .to({}, { duration: 0.2 })
      .call(() => {
        if (ref.current) ref.current.visible = true
      })

    return () => {
      timeline.kill()
    }
  }, [])

  useImperativeHandle(forwardRef, () => ref.current, [])

  const width = 2.55
  const height = 1

  return (
    <mesh position={defaultControls.sunPosition} ref={ref}>
      <boxGeometry args={[width, height, width]} />
      <meshBasicMaterial color={defaultControls.sunColor} />
    </mesh>
  )
})

/* Effects Component */
function Effects() {
  const [material, set] = useState()

  return (
    <>
      <Sun ref={set} />
      {material && (
        <EffectComposer multisampling={0}>
          <GodRays
            sun={material}
            blendFunction={BlendFunction.Screen}
            samples={100}
            density={0.9}
            decay={0.92}
            weight={0.4}
            exposure={0.4}
            clampMax={1}
            width={Resizer.AUTO_SIZE}
            height={Resizer.AUTO_SIZE}
            kernelSize={KernelSize.MEDIUM}
            blur={true}
          />
          {defaultControls.noise && <Noise opacity={defaultControls.noiseOpacity} />}
        </EffectComposer>
      )}
    </>
  )
}

/* Camera Animation Component */
const CamAnimation = () => {
  const timelineRef = useRef(null)

  const { gl, camera } = useThree((state) => ({
    gl: state.gl,
    camera: state.camera
  }))

  const calculateCamPosOnSphericalCoords = useMemo(() => {
    const target = new THREE.Vector3(0.1, 0.55, 0)
    const offset = new THREE.Vector3()

    const quat = new THREE.Quaternion().setFromUnitVectors(
      camera.up,
      new THREE.Vector3(0, 1, 0)
    )
    const quatInverse = quat.clone().invert()

    const spherical = new THREE.Spherical()
    const sphericalDelta = new THREE.Spherical()

    return ({ x = 0, y = 0 }) => {
      sphericalDelta.theta =
        (gl.domElement.clientHeight * Math.PI * x) /
        gl.domElement.clientHeight /
        40
      sphericalDelta.phi =
        -(
          (gl.domElement.clientHeight * Math.PI * y) /
          gl.domElement.clientHeight
        ) /
        30

      offset.copy(config.camera.position).sub(target)
      offset.applyQuaternion(quat)
      spherical.setFromVector3(offset)
      spherical.theta += sphericalDelta.theta
      spherical.phi += sphericalDelta.phi
      offset.setFromSpherical(spherical)
      offset.applyQuaternion(quatInverse)
      sphericalDelta.set(0, 0, 0)

      return { target, offset }
    }
  }, [camera, gl])

  const updateCam = useCallback(
    ({ x = 0, y = 0, immediate = false }) => {
      const { offset, target } = calculateCamPosOnSphericalCoords({ x, y })

      gsap[immediate ? 'set' : 'to'](camera.position, {
        overwrite: true,
        duration: 1,
        x: offset.x,
        y: offset.y,
        z: offset.z,
        ease: 'power2.out',
        onUpdate: () => {
          camera.lookAt(target)
        }
      })
    },
    [calculateCamPosOnSphericalCoords, camera]
  )

  /* Initial camera position */
  useLayoutEffect(() => {
    updateCam({ x: Math.sin(0), y: Math.cos(0), immediate: true })
  }, [updateCam])

  /* Automatic animation */
  useEffect(() => {
    const trgt = { x: 0, y: 0 }
    const FULL_ROTATION_DURATION = 80

    const timeline = gsap.timeline()
    timelineRef.current = timeline

    timeline.to(trgt, {
      duration: FULL_ROTATION_DURATION,
      repeat: -1,
      ease: 'none',
      x: Math.PI * 2,
      y: Math.PI * 2,
      onUpdate: () => {
        const resX = Math.sin(trgt.x)
        const resY = Math.cos(trgt.y)
        updateCam({
          x: resX,
          y: resY,
          immediate: true
        })
      }
    })

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
    }
  }, [updateCam])

  return null
}

/* Particles Component */
const Particles = () => {
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uParticleVelocity: { value: defaultControls.uParticleVelocity },
    uParticleDisplaceFactor: { value: defaultControls.uParticleDisplaceFactor },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uSize: { value: defaultControls.uSize },
    uColor: { value: new THREE.Color(defaultControls.uColor) },
    uAlpha: { value: defaultControls.uAlpha }
  })

  const dustParticlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const count = 1000
    const positions = new Float32Array(count * 3)
    const scale = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      scale[i] = 1
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))

    return geometry
  }, [])

  useFrame((state) => {
    uniformsRef.current.uTime.value = state.clock.getElapsedTime()
  })

  return (
    <points geometry={dustParticlesGeometry} dispose={null}>
      <shaderMaterial
        uniforms={uniformsRef.current}
        vertexShader={particlesVert}
        fragmentShader={particlesFrag}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

/* Main Scene Component */
const BunkerScene = () => {
  return (
    <>
      {/* Ambient */}
      <fog
        attach="fog"
        args={[defaultControls.fogColor, defaultControls.fogNear, defaultControls.fogFar]}
      />
      <ambientLight intensity={defaultControls.ambientLightIntensity} />

      {/* Camera Animation */}
      <CamAnimation />

      {/* Model */}
      <group rotation={[0, -Math.PI / 5.5, 0]}>
        <BunkerModel position={[0, -3, 0]} scale={0.2} />
        <Effects />
      </group>

      {/* Particles */}
      <Particles />
    </>
  )
}

/* BunkerBackground Component */
export default function BunkerBackground() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0
      }}
    >
      <Canvas
        camera={{
          position: config.camera.position,
          rotation: config.camera.rotation,
          fov: config.camera.fov
        }}
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <BunkerScene />
        </Suspense>
      </Canvas>
    </div>
  )
}
