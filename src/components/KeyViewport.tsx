import { Suspense, useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  OrbitControls,
} from '@react-three/drei'
import type { Group } from 'three'
import type { Face, KeyPair } from '../types'
import { KeyMesh } from './KeyMesh'
import { keyNameFromPair } from '../logic/puzzle'
import { KEY_LABEL } from '../types'
import { DoorMarker } from './DoorMarker'

function RotatingKey({ pair }: { pair: KeyPair }) {
  const group = useRef<Group>(null)
  const dragging = useRef(false)

  useFrame((_, delta) => {
    if (!group.current || dragging.current) return
    group.current.rotation.y += delta * 0.35
  })

  return (
    <>
      <group ref={group} position={[0, 0.15, 0]} scale={0.92}>
        <KeyMesh pair={pair} />
      </group>
      <ContactShadows
        position={[0, -1.55, 0]}
        opacity={0.28}
        scale={8}
        blur={2.8}
        far={4}
      />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        target={[0, 0.05, 0]}
        minPolarAngle={0.55}
        maxPolarAngle={Math.PI / 1.85}
        onStart={() => {
          dragging.current = true
        }}
        onEnd={() => {
          dragging.current = false
        }}
      />
    </>
  )
}

interface KeyViewportProps {
  pair: KeyPair
  door: Face
  open: boolean
  pending?: boolean
  flash?: boolean
  idle?: boolean
  deniedReason?: string | null
  onDissect: () => void
  onDeniedHover?: (reason: string) => void
}

export function KeyViewport({
  pair,
  door,
  open,
  pending,
  flash = false,
  idle = false,
  deniedReason = null,
  onDissect,
  onDeniedHover,
}: KeyViewportProps) {
  const name = keyNameFromPair(pair)
  const label = KEY_LABEL[name]
  const faces = `${pair[0][0].toUpperCase()}+${pair[1][0].toUpperCase()}`
  const canDeny = Boolean(deniedReason)
  const blocked = idle || canDeny
  const [hoverDenied, setHoverDenied] = useState(false)
  const [press, setPress] = useState(false)
  const showDenied = canDeny && hoverDenied

  return (
    <div
      className={`key-card${pending ? ' pending' : ''}${showDenied ? ' denied' : ''}${flash ? ' flash' : ''}${open ? ' door-open' : ''}`}
    >
      <DoorMarker face={door} open={open} />
      <div className="key-canvas" title="Drag to rotate">
        <Canvas
          camera={{ position: [3.2, 2.15, 3.75], fov: 40 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={['#0b121a']} />
          <ambientLight intensity={0.35} />
          <directionalLight position={[4, 7, 3]} intensity={0.85} />
          <directionalLight position={[-3, 2, -2]} intensity={0.25} />
          <Suspense fallback={null}>
            <Environment preset="city" environmentIntensity={0.55} />
            <RotatingKey pair={pair} />
          </Suspense>
        </Canvas>
      </div>
      <div className="key-meta" title={`${label}: ${faces}`}>
        <span className="key-name">{label}</span>
        <span className="key-faces">{faces}</span>
      </div>
      <button
        type="button"
        className={`btn primary key-dissect${showDenied ? ' denied' : ''}${blocked ? ' blocked' : ''}${press ? ' press' : ''}`}
        onClick={() => {
          if (blocked) return
          setPress(true)
          window.setTimeout(() => setPress(false), 160)
          onDissect()
        }}
        aria-disabled={blocked}
        onMouseEnter={() => {
          if (!deniedReason) return
          setHoverDenied(true)
          onDeniedHover?.(deniedReason)
        }}
        onMouseLeave={() => setHoverDenied(false)}
        title={
          idle
            ? 'Select a pool shape first'
            : deniedReason
              ? deniedReason
              : pending
                ? 'Dissect to complete exchange'
                : 'Dissect selected shape from this key'
        }
      >
        {showDenied ? 'Denied' : 'Dissect'}
      </button>
    </div>
  )
}
