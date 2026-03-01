import { useCursor, useGLTF } from '@react-three/drei'
import gsap from 'gsap'
import { useCallback, useEffect, useRef, useState } from 'react'

import { InnerScene } from './inner-scene'
import { RenderTexture } from './render-texture'
import { screenMaterial } from './screen-material'

// Fixed screen settings
const SCREEN_SIZE = 200
const RGB_ACTIVE = true

export const Computer = () => {
  const { nodes } = useGLTF('/models/monitor.glb')

  const [isOn, setIsOn] = useState(true)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  // Here we will store the texture from the inner scene.
  const [screenTexture, setScreenTexture] = useState(null)

  useEffect(() => {
    screenMaterial.uniforms.map.value = screenTexture
  }, [screenTexture])

  useEffect(() => {
    screenMaterial.uniforms.screenSize.value = [SCREEN_SIZE, SCREEN_SIZE]
    screenMaterial.uniforms.rgbActive.value = RGB_ACTIVE
  }, [])

  const isTvOn = useRef(true)

  const currentTl = useRef(null)
  const turnTv = useCallback(() => {
    isTvOn.current = !isTvOn.current

    if (currentTl.current) {
      currentTl.current.kill()
    }

    if (isTvOn.current) {
      const tl = gsap.timeline()
      setIsOn(true)
      tl.set(screenMaterial.uniforms.screenOn.value, {
        z: 1
      })
      tl.to(screenMaterial.uniforms.screenOn.value, {
        x: 1,
        duration: 0.1
      })

      tl.to(screenMaterial.uniforms.screenOn.value, {
        y: 1,
        duration: 0.2,
        ease: 'power2.out'
      })
      currentTl.current = tl
    } else {
      const tl = gsap.timeline()
      tl.to(screenMaterial.uniforms.screenOn.value, {
        y: 100,
        duration: 0.2
      })

      tl.to(screenMaterial.uniforms.screenOn.value, {
        x: 100,
        delay: 0.3,
        duration: 0.2
      })
      tl.to(screenMaterial.uniforms.screenOn.value, {
        z: 0,
        duration: 0.1,
        onComplete: () => setIsOn(false)
      })
      currentTl.current = tl
    }
  }, [])

  return (
    <>
      {/* on/off button */}
      <mesh
        position={[-0.28, 0.27, 0.5]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={turnTv}
      >
        <boxGeometry args={[0.1, 0.05, 0.1]} />
        <meshStandardMaterial color="black" />
      </mesh>

      <group>
        <primitive object={nodes.monitor}>
          <meshStandardMaterial color="#555" />
        </primitive>
        <primitive object={nodes.cable} />
        <primitive object={nodes.pantalla}>
          {/* Lets attach our custom material to the screen */}
          <primitive object={screenMaterial}>
            {/* Here we can add the child scene as a texture to the material */}
            <RenderTexture
              width={SCREEN_SIZE}
              height={SCREEN_SIZE}
              isPlaying={isOn}
              onMapTexture={setScreenTexture}
            >
              <InnerScene />
            </RenderTexture>
          </primitive>
        </primitive>
      </group>
    </>
  )
}
