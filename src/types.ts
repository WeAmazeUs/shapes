export type Face = 'circle' | 'triangle' | 'square'

export type KeyPair = [Face, Face]

export type KeyName =
  | 'sphere'
  | 'pyramid'
  | 'cube'
  | 'cone'
  | 'cylinder'
  | 'prism'

export interface DoorState {
  shape: Face
  open: boolean
}

export interface PendingDissect {
  keyIndex: number
  face: Face
}

export const FACE_ORDER: Face[] = ['circle', 'triangle', 'square']

export const FACE_LABEL: Record<Face, string> = {
  circle: 'Circle',
  triangle: 'Triangle',
  square: 'Square',
}

/** Shared palette — used by 2D UI and 3D keys.
 *  Avoid pure red/green here so door ✓ (green) / ✗ (red) stay readable. */
export const FACE_COLOR: Record<Face, string> = {
  circle: '#3d8bfd',
  triangle: '#e8a54b',
  square: '#b57bff',
}

/** Slightly brighter edge tint matching each face color. */
export const FACE_EDGE_COLOR: Record<Face, string> = {
  circle: '#9bc4ff',
  triangle: '#ffd089',
  square: '#d7b8ff',
}

export const DOOR_MARK_COLOR = {
  open: '#22c55e',
  closed: '#ef4444',
} as const

export const KEY_LABEL: Record<KeyName, string> = {
  sphere: 'Sphere',
  pyramid: 'Pyramid',
  cube: 'Cube',
  cone: 'Cone',
  cylinder: 'Cylinder',
  prism: 'Prism',
}
