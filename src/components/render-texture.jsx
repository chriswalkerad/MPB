/**
 * Based on RenderTexture from @react-three/drei
 * Source: https://github.com/pmndrs/drei/blob/master/src/core/RenderTexture.tsx
 */

import { createPortal, useFrame, useThree } from '@react-three/fiber'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import * as THREE from 'three'

export const renderTextureContext = createContext({
  isInsideRenderTexture: false,
  width: 1000,
  height: 1000,
  aspect: 1,
  isPlaying: true
})

export const useRenderTexture = () => {
  return useContext(renderTextureContext)
}

export const useTextureFrame = (callback, priority) => {
  const { isPlaying } = useRenderTexture()

  const elapsedTimeRef = useRef(0)
  useFrame((state, delta, frame) => {
    if (!isPlaying) return
    elapsedTimeRef.current += delta
    callback({
      elapsedTime: elapsedTimeRef.current,
      state,
      delta,
      frame
    })
  }, priority)
}

export const RenderTexture = ({
  isPlaying: _playing = true,
  width = 1000,
  height = 1000,
  attach,
  fbo: _fbo,
  onMapTexture,
  onDepthTexture,
  containerScene,
  children,
  useGlobalPointer,
  renderPriority
}) => {
  const fbo = useMemo(() => {
    const fbo =
      _fbo ||
      new THREE.WebGLRenderTarget(width, height, {
        samples: 16,
        stencilBuffer: true,
        depthTexture: new THREE.DepthTexture(
          width,
          height,
          THREE.UnsignedInt248Type
        ),
        format: THREE.RGBAFormat
      })
    return fbo
  }, [_fbo])

  useEffect(() => {
    if (onMapTexture) {
      onMapTexture(fbo.texture)
    }
  }, [fbo.texture])

  useEffect(() => {
    if (onDepthTexture) {
      onDepthTexture(fbo.depthTexture)
    }
  }, [fbo.depthTexture])

  const portalScene = useMemo(() => {
    return containerScene || new THREE.Scene()
  }, [containerScene])

  const isPlayingRef = useRef(_playing)
  const [isPlaying, setIsPlaying] = useState(_playing)

  const viewportSize = useThree((state) => state.size)
  const viewportSizeRef = useRef(viewportSize)
  viewportSizeRef.current = viewportSize

  useEffect(() => {
    fbo.setSize(width, height)
    const abortController = new AbortController()
    const signal = abortController.signal

    setIsPlaying(true)
    isPlayingRef.current = true
    if (_playing) return
    setTimeout(() => {
      if (signal.aborted) return
      setIsPlaying(false)
      isPlayingRef.current = false
    }, 100)

    return () => {
      abortController.abort()
    }
  }, [fbo, _playing, width, height, setIsPlaying])

  const viewportUvCompute = useCallback(
    (event, state) => {
      if (!isPlayingRef.current) return
      if (!viewportSizeRef.current) return
      const { width, height, left, top } = viewportSizeRef.current
      const x = event.clientX - left
      const y = event.clientY - top
      state.pointer.set((x / width) * 2 - 1, -(y / height) * 2 + 1)
      state.raycaster.setFromCamera(state.pointer, state.camera)
    },
    [viewportSizeRef, isPlayingRef]
  )

  const uvCompute = useCallback(
    (event, state, previous) => {
      if (!isPlayingRef.current) return

      let parent = fbo.texture?.__r3f?.parent
      while (parent && !(parent instanceof THREE.Object3D)) {
        parent = parent.__r3f.parent
      }
      if (!parent) return false

      if (!previous.raycaster.camera) {
        previous.events.compute?.(
          event,
          previous,
          previous.previousRoot?.getState()
        )
      }

      const [intersection] = previous.raycaster.intersectObject(parent)

      if (!intersection) return false

      const uv = intersection.uv
      if (!uv) return false
      state.raycaster.setFromCamera(
        state.pointer.set(uv.x * 2 - 1, uv.y * 2 - 1),
        state.camera
      )
    },
    []
  )

  return (
    <>
      <renderTextureContext.Provider
        value={{
          isInsideRenderTexture: true,
          width,
          height,
          aspect: width / height,
          isPlaying
        }}
      >
        {createPortal(
          <SceneContainer fbo={fbo} renderPriority={renderPriority}>
            {children}
            <group onPointerOver={() => null} />
          </SceneContainer>,
          portalScene,
          {
            events: {
              compute: useGlobalPointer ? viewportUvCompute : uvCompute,
              priority: 0
            }
          }
        )}
      </renderTextureContext.Provider>
      <primitive object={fbo.texture} attach={attach} />
    </>
  )
}

const SceneContainer = ({ fbo, renderPriority, children }) => {
  useTextureFrame(({ state }) => {
    state.gl.setRenderTarget(fbo)
    state.gl.render(state.scene, state.camera)
    state.gl.setRenderTarget(null)
  }, renderPriority)

  return <>{children}</>
}
