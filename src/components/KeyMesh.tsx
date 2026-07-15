import { useMemo } from 'react'
import { Edges } from '@react-three/drei'
import * as THREE from 'three'
import type { Face, KeyPair } from '../types'
import { FACE_COLOR, FACE_EDGE_COLOR } from '../types'
import { keyNameFromPair } from '../logic/puzzle'

const FACE_OPACITY = 0.65

function mat(face: Face, side: THREE.Side = THREE.DoubleSide) {
  return new THREE.MeshPhysicalMaterial({
    color: FACE_COLOR[face],
    metalness: 0.05,
    roughness: 0.28,
    transmission: 0.12,
    thickness: 0.4,
    clearcoat: 0.55,
    clearcoatRoughness: 0.35,
    transparent: true,
    opacity: FACE_OPACITY,
    depthWrite: false,
    side,
  })
}

function FaceEdges({ face, threshold = 20 }: { face: Face; threshold?: number }) {
  return (
    <Edges
      threshold={threshold}
      color={FACE_EDGE_COLOR[face]}
      scale={1.003}
    />
  )
}

function SphereKey({ pair }: { pair: KeyPair }) {
  const top = useMemo(() => mat(pair[0]), [pair])
  const bottom = useMemo(() => mat(pair[1]), [pair])
  return (
    <group>
      <mesh material={top}>
        <sphereGeometry args={[1.05, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <FaceEdges face={pair[0]} threshold={1} />
      </mesh>
      <mesh material={bottom} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[1.05, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <FaceEdges face={pair[1]} threshold={1} />
      </mesh>
      {/* Equator seam between the two face colors */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.04, 1.06, 64]} />
        <meshBasicMaterial
          color={FACE_EDGE_COLOR[pair[0]]}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

function CubeKey({ pair }: { pair: KeyPair }) {
  const a = useMemo(() => mat(pair[0]), [pair])
  const b = useMemo(() => mat(pair[1]), [pair])
  const materials = useMemo(() => [b, b, a, b, a, a], [a, b])
  return (
    <mesh material={materials}>
      <boxGeometry args={[1.55, 1.55, 1.55]} />
      <FaceEdges face={pair[0]} />
    </mesh>
  )
}

function triGeom(a: number[], b: number[], c: number[]) {
  const g = new THREE.BufferGeometry()
  g.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array([...a, ...b, ...c]), 3),
  )
  g.computeVertexNormals()
  return g
}

function PyramidKey({ pair }: { pair: KeyPair }) {
  const m0 = useMemo(() => mat(pair[0]), [pair])
  const m1 = useMemo(() => mat(pair[1]), [pair])

  const faces = useMemo(() => {
    const apex = [0, 1.15, 0]
    const p0 = [-1, -0.75, 1]
    const p1 = [1, -0.75, 1]
    const p2 = [1, -0.75, -1]
    const p3 = [-1, -0.75, -1]
    return [
      triGeom(apex, p0, p1),
      triGeom(apex, p1, p2),
      triGeom(apex, p2, p3),
      triGeom(apex, p3, p0),
    ]
  }, [])

  const faceColors: Face[] = [pair[0], pair[1], pair[0], pair[1]]

  return (
    <group>
      {faces.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={i % 2 === 0 ? m0 : m1}>
          <FaceEdges face={faceColors[i]} />
        </mesh>
      ))}
    </group>
  )
}

function ConeKey({ pair }: { pair: KeyPair }) {
  const bodyFace: Face = pair.includes('triangle') ? 'triangle' : pair[0]
  const baseFace: Face = pair.includes('circle') ? 'circle' : pair[1]
  const body = useMemo(() => mat(bodyFace), [bodyFace])
  const base = useMemo(() => mat(baseFace), [baseFace])
  return (
    <group>
      <mesh material={body} position={[0, 0.1, 0]}>
        <coneGeometry args={[1.05, 1.9, 48, 1, true]} />
        <FaceEdges face={bodyFace} threshold={1} />
      </mesh>
      <mesh material={base} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.85, 0]}>
        <circleGeometry args={[1.05, 48]} />
        <FaceEdges face={baseFace} threshold={1} />
      </mesh>
    </group>
  )
}

function CylinderKey({ pair }: { pair: KeyPair }) {
  const sideFace: Face = pair.includes('square') ? 'square' : pair[0]
  const capFace: Face = pair.includes('circle') ? 'circle' : pair[1]
  const side = useMemo(() => mat(sideFace), [sideFace])
  const cap = useMemo(() => mat(capFace), [capFace])
  return (
    <group>
      <mesh material={side}>
        <cylinderGeometry args={[0.95, 0.95, 1.75, 48, 1, true]} />
        <FaceEdges face={sideFace} threshold={1} />
      </mesh>
      <mesh material={cap} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.875, 0]}>
        <circleGeometry args={[0.95, 48]} />
        <FaceEdges face={capFace} threshold={1} />
      </mesh>
      <mesh material={cap} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.875, 0]}>
        <circleGeometry args={[0.95, 48]} />
        <FaceEdges face={capFace} threshold={1} />
      </mesh>
    </group>
  )
}

function PrismKey({ pair }: { pair: KeyPair }) {
  const endFace: Face = pair.includes('triangle') ? 'triangle' : pair[0]
  const sideFace: Face = pair.includes('square') ? 'square' : pair[1]
  const end = useMemo(() => mat(endFace), [endFace])
  const side = useMemo(() => mat(sideFace), [sideFace])

  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 1.05)
    s.lineTo(1.0, -0.75)
    s.lineTo(-1.0, -0.75)
    s.closePath()
    return s
  }, [])

  const length = 1.7

  return (
    <group rotation={[0, Math.PI / 2, Math.PI / 2]}>
      <mesh material={side} position={[0, 0, -length / 2]}>
        <extrudeGeometry
          args={[shape, { depth: length, bevelEnabled: false, steps: 1 }]}
        />
        <FaceEdges face={sideFace} />
      </mesh>
      <mesh material={end} position={[0, 0, -length / 2]}>
        <shapeGeometry args={[shape]} />
        <FaceEdges face={endFace} />
      </mesh>
      <mesh material={end} position={[0, 0, length / 2]} rotation={[0, Math.PI, 0]}>
        <shapeGeometry args={[shape]} />
        <FaceEdges face={endFace} />
      </mesh>
    </group>
  )
}

interface KeyMeshProps {
  pair: KeyPair
}

export function KeyMesh({ pair }: KeyMeshProps) {
  switch (keyNameFromPair(pair)) {
    case 'sphere':
      return <SphereKey pair={pair} />
    case 'cube':
      return <CubeKey pair={pair} />
    case 'pyramid':
      return <PyramidKey pair={pair} />
    case 'cone':
      return <ConeKey pair={pair} />
    case 'cylinder':
      return <CylinderKey pair={pair} />
    case 'prism':
      return <PrismKey pair={pair} />
  }
}
