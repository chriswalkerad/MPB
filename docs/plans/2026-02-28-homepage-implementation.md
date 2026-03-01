# Homepage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the homepage with 3D bunker background and content overlay (nav, hero, floating cards, subscribe panel).

**Architecture:** Extract 3D scene into reusable component, create overlay components, compose them in new homepage. No tests for this MVP (visual components, weekend build).

**Tech Stack:** React, react-three-fiber, react-router-dom, CSS-in-JS (inline styles), GSAP

---

## Task 1: Update index.html title and meta

**Files:**
- Modify: `index.html`

**Step 1: Update the HTML**

Change title from "My Printer Broke" to "My Computer Broke":

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Computer Broke | Every Cyber Event</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body, #root { width: 100%; height: 100%; overflow: hidden; }
      body { background: #000; font-family: 'Outfit', sans-serif; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Step 2: Verify dev server runs**

Run: `cd /Users/kwis/MPB && npm run dev`
Expected: Server starts, no errors

**Step 3: Commit**

```bash
cd /Users/kwis/MPB
git add index.html
git commit -m "chore: update title and add fonts for My Computer Broke"
```

---

## Task 2: Extract BunkerScene into reusable component

**Files:**
- Create: `src/components/BunkerBackground.jsx`
- Modify: `src/pages/Bunker.jsx`

**Step 1: Create BunkerBackground component**

Create `src/components/BunkerBackground.jsx`:

```jsx
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, GodRays, Noise } from '@react-three/postprocessing'
import { BlendFunction, KernelSize, Resizer } from 'postprocessing'
import { gsap } from 'gsap'
import {
  forwardRef,
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

const config = {
  camera: {
    position: new THREE.Vector3(0.7507294368005816, -2, 8.688852630592953),
    rotation: new THREE.Euler(0.3679671281735305, 0.06208526103691726, -0.023915566989092085),
    fov: 10
  }
}

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

const BunkerModel = (props) => {
  const scene = useThree((s) => s.scene)
  const { nodes, materials } = useGLTF('/models/bunker.glb')

  useLayoutEffect(() => {
    if (materials.Mat_in) {
      materials.Mat_in.fog = false
    }
  }, [materials.Mat_in, scene])

  if (!nodes || !materials) return null

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

const Sun = forwardRef(function Sun(props, forwardRef) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.visible = false

    const timeline = gsap.timeline()
    timeline
      .to({}, { duration: 2.5 })
      .call(() => { if (ref.current) ref.current.visible = true })
      .to({}, { duration: 0.05 })
      .call(() => { if (ref.current) ref.current.visible = false })
      .to({}, { duration: 0.05 })
      .call(() => { if (ref.current) ref.current.visible = true })
      .to({}, { duration: 0.05 })
      .call(() => { if (ref.current) ref.current.visible = false })
      .to({}, { duration: 0.2 })
      .call(() => { if (ref.current) ref.current.visible = true })

    return () => timeline.kill()
  }, [])

  useImperativeHandle(forwardRef, () => ref.current, [])

  return (
    <mesh position={defaultControls.sunPosition} ref={ref}>
      <boxGeometry args={[2.55, 1, 2.55]} />
      <meshBasicMaterial color={defaultControls.sunColor} />
    </mesh>
  )
})

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

const CamAnimation = () => {
  const timelineRef = useRef(null)
  const { gl, camera } = useThree((state) => ({ gl: state.gl, camera: state.camera }))

  const calculateCamPosOnSphericalCoords = useMemo(() => {
    const target = new THREE.Vector3(0.1, 0.55, 0)
    const offset = new THREE.Vector3()
    const quat = new THREE.Quaternion().setFromUnitVectors(camera.up, new THREE.Vector3(0, 1, 0))
    const quatInverse = quat.clone().invert()
    const spherical = new THREE.Spherical()
    const sphericalDelta = new THREE.Spherical()

    return ({ x = 0, y = 0 }) => {
      sphericalDelta.theta = (gl.domElement.clientHeight * Math.PI * x) / gl.domElement.clientHeight / 40
      sphericalDelta.phi = -((gl.domElement.clientHeight * Math.PI * y) / gl.domElement.clientHeight) / 30
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
        onUpdate: () => camera.lookAt(target)
      })
    },
    [calculateCamPosOnSphericalCoords, camera]
  )

  useLayoutEffect(() => {
    updateCam({ x: Math.sin(0), y: Math.cos(0), immediate: true })
  }, [updateCam])

  useEffect(() => {
    const trgt = { x: 0, y: 0 }
    const timeline = gsap.timeline()
    timelineRef.current = timeline

    timeline.to(trgt, {
      duration: 80,
      repeat: -1,
      ease: 'none',
      x: Math.PI * 2,
      y: Math.PI * 2,
      onUpdate: () => {
        updateCam({ x: Math.sin(trgt.x), y: Math.cos(trgt.y), immediate: true })
      }
    })

    return () => timelineRef.current?.kill()
  }, [updateCam])

  return null
}

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

const BunkerScene = () => (
  <>
    <fog attach="fog" args={[defaultControls.fogColor, defaultControls.fogNear, defaultControls.fogFar]} />
    <ambientLight intensity={defaultControls.ambientLightIntensity} />
    <CamAnimation />
    <group rotation={[0, -Math.PI / 5.5, 0]}>
      <BunkerModel position={[0, -3, 0]} scale={0.2} />
      <Effects />
    </group>
    <Particles />
  </>
)

export default function BunkerBackground() {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0
    }}>
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
```

**Step 2: Update Bunker.jsx to use the new component**

Update `src/pages/Bunker.jsx` to just import and use the background:

```jsx
import BunkerBackground from '../components/BunkerBackground'

export default function Bunker() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <BunkerBackground />
    </div>
  )
}
```

**Step 3: Verify it still works**

Run: `cd /Users/kwis/MPB && npm run dev`
Visit: http://localhost:5173/bunker
Expected: Same 3D scene as before

**Step 4: Commit**

```bash
cd /Users/kwis/MPB
git add src/components/BunkerBackground.jsx src/pages/Bunker.jsx
git commit -m "refactor: extract BunkerBackground into reusable component"
```

---

## Task 3: Create event data file

**Files:**
- Create: `src/data/events.json`

**Step 1: Create the events data**

Create `src/data/events.json`:

```json
[
  {
    "name": "BSides Los Angeles 2026",
    "slug": "bsides-la-2026",
    "date": "Mar 15",
    "type": "conference",
    "city": "Los Angeles, CA"
  },
  {
    "name": "OWASP SoCal Monthly",
    "slug": "owasp-socal-monthly",
    "date": "Mar 4",
    "type": "meetup",
    "city": "Irvine, CA"
  },
  {
    "name": "ISSA LA Chapter Meeting",
    "slug": "issa-la-chapter",
    "date": "Mar 11",
    "type": "chapter",
    "city": "Los Angeles, CA"
  },
  {
    "name": "SecureWorld San Diego",
    "slug": "secureworld-san-diego",
    "date": "Mar 19-20",
    "type": "conference",
    "city": "San Diego, CA"
  },
  {
    "name": "DEF CON Group 562",
    "slug": "defcon-562",
    "date": "Mar 7",
    "type": "meetup",
    "city": "Long Beach, CA"
  },
  {
    "name": "HIPAA Security Summit",
    "slug": "hipaa-security-summit",
    "date": "Apr 7-10",
    "type": "virtual",
    "city": "Online"
  }
]
```

**Step 2: Commit**

```bash
cd /Users/kwis/MPB
git add src/data/events.json
git commit -m "feat: add sample events data"
```

---

## Task 4: Create FloatingCard component

**Files:**
- Create: `src/components/FloatingCard.jsx`

**Step 1: Create the component**

Create `src/components/FloatingCard.jsx`:

```jsx
const TYPE_COLORS = {
  conference: '#ff6b35',
  meetup: '#00d4aa',
  chapter: '#a78bfa',
  virtual: '#f472b6',
  workshop: '#facc15',
  webinar: '#38bdf8'
}

export default function FloatingCard({ event, style, delay = 0 }) {
  const color = TYPE_COLORS[event.type] || '#fff'

  return (
    <div
      style={{
        ...style,
        position: 'absolute',
        animation: `floatIn 0.8s ease-out ${delay}s both, gentleFloat 6s ease-in-out ${delay}s infinite`,
        pointerEvents: 'auto'
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '16px 20px',
          minWidth: '240px',
          cursor: 'default',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
          e.currentTarget.style.border = `1px solid ${color}33`
          e.currentTarget.style.transform = 'scale(1.03)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 8px ${color}66`
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: color,
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            {event.type}
          </span>
          <span
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.35)',
              marginLeft: 'auto',
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            {event.date}
          </span>
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '4px',
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          {event.name}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.35)',
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          {event.city}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
cd /Users/kwis/MPB
git add src/components/FloatingCard.jsx
git commit -m "feat: add FloatingCard component"
```

---

## Task 5: Create SubscribePanel component

**Files:**
- Create: `src/components/SubscribePanel.jsx`

**Step 1: Create the component**

Create `src/components/SubscribePanel.jsx`:

```jsx
import { useState } from 'react'

const NAV_HEIGHT = 60

export default function SubscribePanel({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')

    // TODO: Replace with actual Beehiiv endpoint
    // For now, simulate success
    setTimeout(() => {
      setStatus('success')
      setEmail('')
    }, 1000)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 90,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: NAV_HEIGHT,
          right: 0,
          width: '380px',
          height: `calc(100vh - ${NAV_HEIGHT}px)`,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          zIndex: 100,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px',
            lineHeight: 1
          }}
        >
          ×
        </button>

        <h2
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'white',
            marginBottom: '8px',
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          Weekly cyber events
          <br />
          in your inbox.
        </h2>

        <p
          style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '32px',
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          Curated. No spam.
        </p>

        {status === 'success' ? (
          <div
            style={{
              padding: '16px',
              background: 'rgba(0,212,170,0.1)',
              border: '1px solid rgba(0,212,170,0.3)',
              borderRadius: '12px',
              color: '#00d4aa',
              fontSize: '14px',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            You're in! Check your inbox to confirm.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '15px',
                fontFamily: "'Outfit', sans-serif",
                marginBottom: '16px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                width: '100%',
                padding: '14px',
                background: 'white',
                color: '#09090b',
                border: 'none',
                borderRadius: '100px',
                fontSize: '15px',
                fontWeight: 600,
                fontFamily: "'Outfit', sans-serif",
                cursor: status === 'loading' ? 'wait' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    </>
  )
}
```

**Step 2: Commit**

```bash
cd /Users/kwis/MPB
git add src/components/SubscribePanel.jsx
git commit -m "feat: add SubscribePanel component"
```

---

## Task 6: Create CSS keyframes file

**Files:**
- Create: `src/styles/animations.css`
- Modify: `src/main.jsx`

**Step 1: Create animations.css**

Create `src/styles/animations.css`:

```css
@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gentleFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes navFade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
```

**Step 2: Import in main.jsx**

Update `src/main.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/animations.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**Step 3: Create styles directory**

Run: `mkdir -p /Users/kwis/MPB/src/styles`

**Step 4: Commit**

```bash
cd /Users/kwis/MPB
git add src/styles/animations.css src/main.jsx
git commit -m "feat: add CSS keyframe animations"
```

---

## Task 7: Create Homepage component

**Files:**
- Create: `src/pages/Homepage.jsx`

**Step 1: Create the Homepage**

Create `src/pages/Homepage.jsx`:

```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import BunkerBackground from '../components/BunkerBackground'
import FloatingCard from '../components/FloatingCard'
import SubscribePanel from '../components/SubscribePanel'
import events from '../data/events.json'

const NAV_HEIGHT = 60

// Card positions for organic scatter
const CARD_POSITIONS = [
  { top: '5%', left: '10%' },
  { top: '18%', right: '5%' },
  { top: '35%', left: '20%' },
  { top: '48%', right: '10%' },
  { top: '62%', left: '5%' },
  { top: '75%', right: '15%' }
]

export default function Homepage() {
  const [subscribeOpen, setSubscribeOpen] = useState(false)

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* 3D Background */}
      <BunkerBackground />

      {/* Content Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        {/* Top Nav */}
        <nav
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: NAV_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            zIndex: 100,
            animation: 'navFade 1s ease-out 0.2s both',
            pointerEvents: 'auto'
          }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none'
            }}
          >
            <span style={{ fontSize: '20px' }}>💻</span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                fontSize: '15px',
                color: 'rgba(255,255,255,0.9)',
                letterSpacing: '-0.02em'
              }}
            >
              mycomputerbroke
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button
              onClick={() => setSubscribeOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '14px',
                fontWeight: 400,
                fontFamily: "'Outfit', sans-serif",
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            >
              Subscribe
            </button>
            <Link
              to="/events"
              style={{
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: "'Outfit', sans-serif",
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,1)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            >
              Explore Events <span style={{ fontSize: '12px' }}>↗</span>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '0 40px'
          }}
        >
          {/* Left Column - Copy */}
          <div
            style={{
              flex: '0 0 45%',
              maxWidth: '540px',
              paddingLeft: '20px',
              pointerEvents: 'auto'
            }}
          >
            {/* Badge */}
            <div style={{ animation: 'fadeUp 0.8s ease-out 0.3s both' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '100px',
                  marginBottom: '32px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.5)'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#00d4aa',
                    boxShadow: '0 0 6px #00d4aa66',
                    animation: 'blink 2s ease-in-out infinite'
                  }}
                />
                cybersecurity events, one place
              </div>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: 'clamp(48px, 5.5vw, 72px)',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.035em',
                color: 'white',
                margin: '0 0 24px 0',
                animation: 'fadeUp 0.8s ease-out 0.5s both',
                fontFamily: "'Outfit', sans-serif"
              }}
            >
              Every cyber
              <br />
              event.
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #ff6b35, #ff8f65, #ff6b35)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'shimmer 4s linear infinite'
                }}
              >
                Found here.
              </span>
            </h1>

            {/* Subhead */}
            <p
              style={{
                fontSize: '17px',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.45)',
                margin: '0 0 40px 0',
                maxWidth: '400px',
                fontWeight: 400,
                animation: 'fadeUp 0.8s ease-out 0.7s both',
                fontFamily: "'Outfit', sans-serif"
              }}
            >
              Conferences, meetups, and workshops — curated weekly so you never miss what matters.
            </p>

            {/* CTA */}
            <div style={{ animation: 'fadeUp 0.8s ease-out 0.9s both' }}>
              <Link
                to="/events"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 32px',
                  background: 'white',
                  color: '#09090b',
                  textDecoration: 'none',
                  borderRadius: '100px',
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,255,255,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Attend Your First Event
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Column - Floating Cards */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              height: '70%'
            }}
          >
            {events.slice(0, 6).map((event, i) => (
              <FloatingCard
                key={event.slug}
                event={event}
                style={CARD_POSITIONS[i]}
                delay={0.4 + i * 0.2}
              />
            ))}
          </div>
        </div>

        {/* Bottom Nav */}
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 40px',
            zIndex: 100,
            animation: 'navFade 1s ease-out 0.4s both',
            pointerEvents: 'auto'
          }}
        >
          {/* Left: logo + submit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>💻</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 500,
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.4)'
                }}
              >
                mycomputerbroke
              </span>
            </div>
            <Link
              to="/submit"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '12px',
                color: 'rgba(255,255,255,0.25)',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
            >
              Submit An Event
            </Link>
          </div>

          {/* Right: social icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </nav>
      </div>

      {/* Subscribe Panel */}
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  )
}
```

**Step 2: Commit**

```bash
cd /Users/kwis/MPB
git add src/pages/Homepage.jsx
git commit -m "feat: add Homepage component with 3D background and content overlay"
```

---

## Task 8: Update App.jsx routing

**Files:**
- Modify: `src/App.jsx`

**Step 1: Update the router**

Update `src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage'
import Bunker from './pages/Bunker'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/bunker" element={<Bunker />} />
        {/* Placeholder routes for future pages */}
        <Route path="/events" element={<div style={{ color: 'white', padding: 40 }}>Events page coming soon</div>} />
        <Route path="/submit" element={<div style={{ color: 'white', padding: 40 }}>Submit page coming soon</div>} />
      </Routes>
    </BrowserRouter>
  )
}
```

**Step 2: Verify homepage works**

Run: `cd /Users/kwis/MPB && npm run dev`
Visit: http://localhost:5173/
Expected: 3D bunker background with content overlay, floating cards, working navigation

**Step 3: Commit**

```bash
cd /Users/kwis/MPB
git add src/App.jsx
git commit -m "feat: update routing - homepage with bunker background"
```

---

## Task 9: Delete old Home.jsx

**Files:**
- Delete: `src/pages/Home.jsx`

**Step 1: Remove the old file**

Run: `rm /Users/kwis/MPB/src/pages/Home.jsx`

**Step 2: Commit**

```bash
cd /Users/kwis/MPB
git add -A
git commit -m "chore: remove old Home.jsx"
```

---

## Task 10: Final verification and cleanup

**Step 1: Run dev server and verify all pages**

Run: `cd /Users/kwis/MPB && npm run dev`

Check:
- http://localhost:5173/ — Homepage with 3D background, content, subscribe panel
- http://localhost:5173/bunker — Original bunker scene (still works)
- http://localhost:5173/events — Placeholder
- http://localhost:5173/submit — Placeholder

**Step 2: Test interactions**

- [ ] "Attend Your First Event" button navigates to /events
- [ ] "Explore Events" link navigates to /events
- [ ] "Subscribe" opens slide-in panel
- [ ] Subscribe panel closes with × or clicking backdrop
- [ ] "Submit An Event" navigates to /submit
- [ ] Floating cards have hover effects
- [ ] Animations play on page load

**Step 3: Final commit**

```bash
cd /Users/kwis/MPB
git add -A
git status
# If any uncommitted changes:
git commit -m "chore: final homepage implementation cleanup"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Update index.html title and fonts |
| 2 | Extract BunkerBackground component |
| 3 | Create events data file |
| 4 | Create FloatingCard component |
| 5 | Create SubscribePanel component |
| 6 | Create CSS animations |
| 7 | Create Homepage component |
| 8 | Update App.jsx routing |
| 9 | Delete old Home.jsx |
| 10 | Final verification |

Total: 10 tasks, ~15-20 commits
