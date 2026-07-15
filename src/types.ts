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

export const FACE_COLOR: Record<Face, string> = {
  circle: '#3d8bfd',
  triangle: '#e8a54b',
  square: '#5ecf8a',
}

export const KEY_LABEL: Record<KeyName, string> = {
  sphere: 'Sphere',
  pyramid: 'Pyramid',
  cube: 'Cube',
  cone: 'Cone',
  cylinder: 'Cylinder',
  prism: 'Prism',
}
