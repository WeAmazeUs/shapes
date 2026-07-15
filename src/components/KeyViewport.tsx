import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import type { Face, KeyPair } from '../types'
import { KeyMesh } from './KeyMesh'
import { keyNameFromPair } from '../logic/puzzle'
import { KEY_LABEL } from '../types'
import { DoorMarker } from './DoorMarker'

interface KeyViewportProps {
  pair: KeyPair
  door: Face
  open: boolean
  pending?: boolean
  dissectDisabled?: boolean
  onDissect: () => void
}

export function KeyViewport({
  pair,
  door,
  open,
  pending,
  dissectDisabled,
  onDissect,
}: KeyViewportProps) {
  const name = keyNameFromPair(pair)
  const label = KEY_LABEL[name]
  const faces = `${pair[0][0].toUpperCase()}+${pair[1][0].toUpperCase()}`

  return (
    <div className={`key-card${pending ? ' pending' : ''}`}>
      <DoorMarker face={door} open={open} />
      <div className="key-canvas" title="Drag to rotate">
        <Canvas
          camera={{ position: [2.4, 1.7, 2.8], fov: 38 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 6, 3]} intensity={1.15} />
          <directionalLight position={[-3, 2, -2]} intensity={0.35} />
          <KeyMesh pair={pair} />
          <ContactShadows
            position={[0, -1.35, 0]}
            opacity={0.35}
            scale={8}
            blur={2.2}
            far={4}
          />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={0.55}
            maxPolarAngle={Math.PI / 1.7}
          />
        </Canvas>
      </div>
      <div className="key-meta" title={`${label}: ${faces}`}>
        <span className="key-name">{label}</span>
        <span className="key-faces">{faces}</span>
      </div>
      <button
        type="button"
        className="btn primary key-dissect"
        onClick={onDissect}
        disabled={dissectDisabled}
        title={
          dissectDisabled
            ? 'Select a pool shape first'
            : pending
              ? 'Dissect to complete exchange'
              : 'Dissect selected shape from this key'
        }
      >
        Dissect
      </button>
    </div>
  )
}
