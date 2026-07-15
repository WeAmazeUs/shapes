import type { Face, KeyName, KeyPair } from '../types'

export function normalizePair(a: Face, b: Face): KeyPair {
  const order: Face[] = ['circle', 'triangle', 'square']
  return order.indexOf(a) <= order.indexOf(b) ? [a, b] : [b, a]
}

export function keyNameFromPair(pair: KeyPair): KeyName {
  const [a, b] = normalizePair(pair[0], pair[1])
  if (a === 'circle' && b === 'circle') return 'sphere'
  if (a === 'triangle' && b === 'triangle') return 'pyramid'
  if (a === 'square' && b === 'square') return 'cube'
  if (a === 'circle' && b === 'triangle') return 'cone'
  if (a === 'circle' && b === 'square') return 'cylinder'
  return 'prism'
}

export function opensDoor(pair: KeyPair, door: Face): boolean {
  return pair[0] !== door && pair[1] !== door
}

export function pairContains(pair: KeyPair, face: Face): boolean {
  return pair[0] === face || pair[1] === face
}

/** Replace one occurrence of `from` with `to` in a pair. */
export function replaceFace(pair: KeyPair, from: Face, to: Face): KeyPair {
  if (pair[0] === from) return normalizePair(to, pair[1])
  if (pair[1] === from) return normalizePair(pair[0], to)
  return pair
}

function countFaces(keys: KeyPair[]): Record<Face, number> {
  const counts: Record<Face, number> = { circle: 0, triangle: 0, square: 0 }
  for (const [a, b] of keys) {
    counts[a]++
    counts[b]++
  }
  return counts
}

/** All partitions of {2C,2T,2S} into three unordered pairs. */
function allBalancedPartitions(): KeyPair[][] {
  const faces: Face[] = [
    'circle',
    'circle',
    'triangle',
    'triangle',
    'square',
    'square',
  ]

  const results: KeyPair[][] = []
  const seen = new Set<string>()

  function encode(keys: KeyPair[]): string {
    return keys
      .map((p) => normalizePair(p[0], p[1]).join('+'))
      .sort()
      .join('|')
  }

  // Choose 3 disjoint pairings of 6 indexed faces
  const n = faces.length
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      for (let c = 0; c < n; c++) {
        if (c === a || c === b) continue
        for (let d = c + 1; d < n; d++) {
          if (d === a || d === b) continue
          const used = new Set([a, b, c, d])
          const rest: number[] = []
          for (let i = 0; i < n; i++) if (!used.has(i)) rest.push(i)
          const keys: KeyPair[] = [
            normalizePair(faces[a], faces[b]),
            normalizePair(faces[c], faces[d]),
            normalizePair(faces[rest[0]], faces[rest[1]]),
          ]
          const key = encode(keys)
          if (!seen.has(key)) {
            seen.add(key)
            results.push(keys)
          }
        }
      }
    }
  }
  return results
}

const PARTITIONS = allBalancedPartitions()

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function randomDoors(): Face[] {
  return shuffle(['circle', 'triangle', 'square'])
}

function isSolved(keys: KeyPair[], doors: Face[]): boolean {
  return keys.every((k, i) => opensDoor(k, doors[i]))
}

function hasDoorSymbolInEachKey(keys: KeyPair[], doors: Face[]): boolean {
  return keys.every((k, i) => pairContains(k, doors[i]))
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items]
  const out: T[][] = []
  for (let i = 0; i < items.length; i++) {
    const rest = items.filter((_, j) => j !== i)
    for (const p of permutations(rest)) out.push([items[i], ...p])
  }
  return out
}

/** Find an assignment of a partition to door slots that opens all doors. */
function solvedAssignment(partition: KeyPair[], doors: Face[]): KeyPair[] | null {
  for (const assigned of permutations(partition)) {
    if (isSolved(assigned, doors)) return assigned
  }
  return null
}

function scrambleFromSolved(
  solved: KeyPair[],
  doors: Face[],
  requireDoorSymbol: boolean,
): KeyPair[] {
  let keys = solved.map((p) => [...p] as KeyPair)

  // Random face swaps between keys
  for (let attempt = 0; attempt < 40; attempt++) {
    const i = Math.floor(Math.random() * 3)
    let j = Math.floor(Math.random() * 3)
    if (i === j) j = (j + 1) % 3
    const faceA = keys[i][Math.floor(Math.random() * 2)]
    const faceB = keys[j][Math.floor(Math.random() * 2)]
    const next = keys.map((p) => [...p] as KeyPair)
    next[i] = replaceFace(next[i], faceA, faceB)
    next[j] = replaceFace(next[j], faceB, faceA)

    const counts = countFaces(next)
    if (counts.circle !== 2 || counts.triangle !== 2 || counts.square !== 2) continue
    if (isSolved(next, doors)) continue
    if (requireDoorSymbol && !hasDoorSymbolInEachKey(next, doors)) continue
    keys = next
  }

  // If still solved or fails door-symbol constraint, try more aggressively
  if (isSolved(keys, doors) || (requireDoorSymbol && !hasDoorSymbolInEachKey(keys, doors))) {
    for (let attempt = 0; attempt < 200; attempt++) {
      const i = Math.floor(Math.random() * 3)
      let j = Math.floor(Math.random() * 3)
      if (i === j) j = (j + 1) % 3
      const faceA = keys[i][Math.floor(Math.random() * 2)]
      const faceB = keys[j][Math.floor(Math.random() * 2)]
      const next = keys.map((p) => [...p] as KeyPair)
      next[i] = replaceFace(next[i], faceA, faceB)
      next[j] = replaceFace(next[j], faceB, faceA)
      const counts = countFaces(next)
      if (counts.circle !== 2 || counts.triangle !== 2 || counts.square !== 2) continue
      if (isSolved(next, doors)) continue
      if (requireDoorSymbol && !hasDoorSymbolInEachKey(next, doors)) continue
      return next
    }
  }

  return keys
}

export interface PuzzleState {
  doors: Face[]
  keys: KeyPair[]
}

export function generatePuzzle(requireDoorSymbol: boolean): PuzzleState {
  for (let n = 0; n < 80; n++) {
    const doors = randomDoors()
    const partition = PARTITIONS[Math.floor(Math.random() * PARTITIONS.length)]
    const solved = solvedAssignment(partition, doors)
    if (!solved) continue
    const keys = scrambleFromSolved(solved, doors, requireDoorSymbol)
    if (isSolved(keys, doors)) continue
    if (requireDoorSymbol && !hasDoorSymbolInEachKey(keys, doors)) continue
    return { doors, keys }
  }

  // Guaranteed fallback: classic solution scrambled once
  const doors: Face[] = ['circle', 'triangle', 'square']
  const solved: KeyPair[] = [
    ['triangle', 'triangle'],
    ['circle', 'circle'],
    ['square', 'square'],
  ]
  return {
    doors,
    keys: scrambleFromSolved(solved, doors, requireDoorSymbol),
  }
}

export function transferFaces(
  keys: KeyPair[],
  fromIndex: number,
  fromFace: Face,
  toIndex: number,
  toFace: Face,
): KeyPair[] | null {
  if (fromIndex === toIndex) return null
  if (!pairContains(keys[fromIndex], fromFace)) return null
  if (!pairContains(keys[toIndex], toFace)) return null

  const next = keys.map((p) => [...p] as KeyPair)
  next[fromIndex] = replaceFace(next[fromIndex], fromFace, toFace)
  next[toIndex] = replaceFace(next[toIndex], toFace, fromFace)
  return next
}
