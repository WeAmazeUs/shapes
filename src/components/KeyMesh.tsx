import { useMemo } from 'react'
import * as THREE from 'three'
import type { Face, KeyPair } from '../types'
import { FACE_COLOR } from '../types'
import { keyNameFromPair } from '../logic/puzzle'

function mat(face: Face, side: THREE.Side = THREE.FrontSide) {
  return new THREE.MeshStandardMaterial({
    color: FACE_COLOR[face],
    metalness: 0.22,
    roughness: 0.42,
    side,
  })
}

function SphereKey({ pair }: { pair: KeyPair }) {
  const top = useMemo(() => mat(pair[0]), [pair])
  const bottom = useMemo(() => mat(pair[1]), [pair])
  return (
    <group>
      <mesh material={top}>
        <sphereGeometry args={[1.05, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={bottom} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[1.05, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
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
  const m0 = useMemo(() => mat(pair[0], THREE.DoubleSide), [pair])
  const m1 = useMemo(() => mat(pair[1], THREE.DoubleSide), [pair])

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

  return (
    <group>
      <mesh geometry={faces[0]} material={m0} />
      <mesh geometry={faces[1]} material={m1} />
      <mesh geometry={faces[2]} material={m0} />
      <mesh geometry={faces[3]} material={m1} />
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
      </mesh>
      <mesh material={base} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.85, 0]}>
        <circleGeometry args={[1.05, 48]} />
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
      </mesh>
      <mesh material={cap} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.875, 0]}>
        <circleGeometry args={[0.95, 48]} />
      </mesh>
      <mesh material={cap} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.875, 0]}>
        <circleGeometry args={[0.95, 48]} />
      </mesh>
    </group>
  )
}

function PrismKey({ pair }: { pair: KeyPair }) {
  const endFace: Face = pair.includes('triangle') ? 'triangle' : pair[0]
  const sideFace: Face = pair.includes('square') ? 'square' : pair[1]
  const end = useMemo(() => mat(endFace, THREE.DoubleSide), [endFace])
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
        <extrudeGeometry args={[shape, { depth: length, bevelEnabled: false }]} />
      </mesh>
      <mesh material={end} position={[0, 0, -length / 2]}>
        <shapeGeometry args={[shape]} />
      </mesh>
      <mesh material={end} position={[0, 0, length / 2]} rotation={[0, Math.PI, 0]}>
        <shapeGeometry args={[shape]} />
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
