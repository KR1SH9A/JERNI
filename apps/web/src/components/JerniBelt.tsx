
'use client'
import React, { useEffect, useMemo, useRef, useState, Suspense } from 'react'
import type { CSSProperties } from 'react'
import { Canvas, useFrame, useThree, ThreeElements } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Environment, MeshDistortMaterial, Float } from '@react-three/drei'
declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements { }
    }
  }
}
/* ── Tweak these ─────────────────────────────── */
export const CONFIG = {
  radius: 2.3,      // belt radius (world units)
  ribbonH: 0.52,    // ribbon thickness (smaller = thinner)
  waveAmp: 0.38,    // how tall the waves are
  waveCount: 2,     // whole number: waves around the belt
  waveSpeed: 0.55,  // how fast the waves drift
  tilt: 0.87,       // radians. 0 = straight band, ~1.57 = looking down the tube
  roll: -0.28,      // sideways lean of the belt
  speed: 0.32,      // how fast the text flows around (rad/sec)
  logoWidth: 3.0,   // logo width (world units)
}
/* ────────────────────────────────────────────── */
const loadImg = (src: string): Promise<HTMLImageElement> =>
  new Promise((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = src
  })
interface ArtworkConfig {
  logoSrc: string;
  ribbonSrc: string;
  logoColor: string;
  ribbonColor: string;
}
interface ArtworkResult {
  ribbon: HTMLCanvasElement;
  logo: HTMLCanvasElement;
  logoAspect: number;
}
/**
 * Loads both images and paints them onto canvases:
 *  - the logo, recoloured (white by default)
 *  - the ribbon tile: your PNG cropped to its lettering, on a solid colour
 */
function useArtwork({ logoSrc, ribbonSrc, logoColor, ribbonColor }: ArtworkConfig) {
  const [art, setArt] = useState<ArtworkResult | null>(null)
  useEffect(() => {
    let dead = false
    Promise.all([loadImg(logoSrc), loadImg(ribbonSrc)]).then(([logoImg, ribbonImg]) => {
      if (dead) return
      // find the bounding box of the non-transparent pixels in the ribbon PNG
      const probe = document.createElement('canvas')
      probe.width = ribbonImg.width
      probe.height = ribbonImg.height
      const pc = probe.getContext('2d', { willReadFrequently: true })
      if (!pc) return
      pc.drawImage(ribbonImg, 0, 0)
      const px = pc.getImageData(0, 0, probe.width, probe.height).data
      let x0 = probe.width, y0 = probe.height, x1 = 0, y1 = 0
      for (let y = 0; y < probe.height; y++) {
        for (let x = 0; x < probe.width; x++) {
          if (px[(y * probe.width + x) * 4 + 3] > 16) {
            x0 = Math.min(x0, x); x1 = Math.max(x1, x)
            y0 = Math.min(y0, y); y1 = Math.max(y1, y)
          }
        }
      }
      const bw = x1 - x0 + 1
      const bh = y1 - y0 + 1
      const padX = bw * 0 // gap between repeats
      const padY = bh * 0.22 // top / bottom margin
      const S = 3            // texture resolution multiplier
      // ribbon tile
      const ribbon = document.createElement('canvas')
      ribbon.width = Math.round((bw + padX * 2) * S)
      ribbon.height = Math.round((bh + padY * 2) * S)
      const c = ribbon.getContext('2d')
      if (!c) return
      c.fillStyle = ribbonColor
      c.fillRect(0, 0, ribbon.width, ribbon.height)
      c.imageSmoothingQuality = 'high'
      c.drawImage(ribbonImg, x0, y0, bw, bh, padX * S, padY * S, bw * S, bh * S)
      // logo (recoloured)
      const logoAspect = logoImg.naturalWidth / logoImg.naturalHeight
      const logo = document.createElement('canvas')
      logo.width = 2048
      logo.height = Math.round(2048 / logoAspect)
      const lc = logo.getContext('2d')
      if (!lc) return
      lc.drawImage(logoImg, 0, 0, logo.width, logo.height)
      setArt({ ribbon, logo, logoAspect })
    })
    return () => { dead = true }
  }, [logoSrc, ribbonSrc, logoColor, ribbonColor])
  return art
}
interface SceneProps {
  art: ArtworkResult;
}
function Scene({ art }: SceneProps) {
  const gl = useThree((s) => s.gl)
  const tilter = useRef<THREE.Group>(null)
  const logoRef = useRef<THREE.Mesh>(null)
  const look = useRef({ x: 0, y: 0 })
  const boost = useRef(0)
  const reduce = useRef(false)
  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const onWheel = (e: WheelEvent) => { boost.current += e.deltaY * 0.004 }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])
  // textures + wavy geometry, rebuilt only when the artwork changes
  const built = useMemo(() => {
    const aniso = gl.capabilities.getMaxAnisotropy()
    const makeTex = (canvas: HTMLCanvasElement) => {
      const t = new THREE.CanvasTexture(canvas)
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = aniso
      t.wrapS = THREE.RepeatWrapping
      return t
    }
    const R = CONFIG.radius
    const circ = 2 * Math.PI * R
    const tileAspect = art.ribbon.width / art.ribbon.height
    const repeats = Math.max(1, Math.round(circ / (CONFIG.ribbonH * tileAspect)))
    const H = circ / repeats / tileAspect // exact height → no seam
    const logoTex = makeTex(art.logo)
    logoTex.wrapS = THREE.ClampToEdgeWrapping
    const front = makeTex(art.ribbon)
    front.repeat.x = repeats
    const back = makeTex(art.ribbon) // far wall is seen from inside (mirrored) → flip it
    back.repeat.x = -repeats
    const geo = new THREE.CylinderGeometry(R, R, H, 200, 1, true)
    const pos = geo.attributes.position
    const baseY = new Float32Array(pos.count)
    const theta = new Float32Array(pos.count)
    for (let i = 0; i < pos.count; i++) {
      baseY[i] = pos.getY(i)
      theta[i] = Math.atan2(pos.getX(i), pos.getZ(i))
    }
    const W = Math.round(CONFIG.waveCount)
    const wave = (t: number) => {
      for (let i = 0; i < pos.count; i++) {
        const a = theta[i]
        const w =
          Math.sin(a * W + t * CONFIG.waveSpeed) +
          0.35 * Math.sin(a * (W + 1) - t * CONFIG.waveSpeed * 1.6)
        pos.setY(i, baseY[i] + CONFIG.waveAmp * w)
      }
      pos.needsUpdate = true
    }
    wave(0)
    return { logoTex, front, back, geo, repeats, wave }
  }, [art, gl])
  useEffect(
    () => () => {
      built.logoTex.dispose()
      built.front.dispose()
      built.back.dispose()
      built.geo.dispose()
    },
    [built]
  )
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    // text flows through the wave (front/back move opposite in UV space → same direction on screen)
    boost.current *= Math.pow(0.02, dt)
    const flow = (((reduce.current ? 0.05 : CONFIG.speed) + boost.current) * dt) / (2 * Math.PI)
    built.front.offset.x += built.repeats * flow
    built.back.offset.x -= built.repeats * flow
    if (!reduce.current) built.wave(t)
    // pointer parallax
    look.current.x += (state.pointer.x - look.current.x) * 0.06
    look.current.y += (-state.pointer.y - look.current.y) * 0.06
    if (tilter.current) {
      tilter.current.rotation.x = CONFIG.tilt + look.current.y * 0.12
      tilter.current.rotation.y = look.current.x * 0.22
    }
    if (logoRef.current) {
      logoRef.current.rotation.y = look.current.x * 0.12
      logoRef.current.rotation.x = look.current.y * 0.06
      logoRef.current.position.y = 0 // No vertical bobbing
    }
  })
  return (
    <>
      <mesh ref={logoRef}>
        <planeGeometry args={[CONFIG.logoWidth, CONFIG.logoWidth / art.logoAspect]} />
        <meshBasicMaterial map={built.logoTex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={tilter} rotation={[CONFIG.tilt, 0, CONFIG.roll]}>
        <mesh geometry={built.geo} renderOrder={1}>
          <meshBasicMaterial map={built.front} side={THREE.FrontSide} toneMapped={false} />
        </mesh>
        <mesh geometry={built.geo} renderOrder={1}>
          {/* slightly dimmer far side for depth */}
          <meshBasicMaterial map={built.back} side={THREE.BackSide} color="#e7e7e7" toneMapped={false} />
        </mesh>
      </group>
    </>
  )
}
/** Keeps the whole belt in view on any screen shape. */
function FitCamera() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  useEffect(() => {
    const R = CONFIG.radius
    const needW = R * 2.5
    const needH = R * Math.sin(CONFIG.tilt) * 2 + 1.6 + CONFIG.waveAmp * 2
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const aspect = size.width / size.height
    camera.position.z = Math.max(needH / (2 * t), needW / (2 * t * aspect))
    camera.updateProjectionMatrix()
  }, [camera, size])
  return null
}



export interface JerniBeltProps {
  logoSrc?: string;
  ribbonSrc?: string;
  bg?: string;
  logoColor?: string;
  ribbonColor?: string;
  className?: string;
  style?: CSSProperties;
}
function PostProcessingEffects() {
  return (
    < EffectComposer enableNormalPass={false} >
      < Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={0.2} />
    </EffectComposer >
  )
}
export default function JerniBelt({
  logoSrc = '/new-logo.svg',
  ribbonSrc = '/new-label.png',
  bg = '#000000ff', // changed to light theme
  logoColor = '#4C5372', // dark slate logo for light background
  ribbonColor = '#f8f8ff',
  className,
  style,
}: JerniBeltProps) {
  const art = useArtwork({ logoSrc, ribbonSrc, logoColor, ribbonColor })
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        background: '#ffce39ff',
        ...style
      }}
    >
      <Canvas
        camera={{ fov: 35, position: [0, 0, 8] }}
        dpr={[1, 2]}
        gl={{ alpha: true }}
      >
        <React.Suspense fallback={null}>
        </React.Suspense>
        <FitCamera />
        {art && < Scene art={art} />}
      </Canvas>
    </div>
  )
}