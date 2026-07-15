import { useMemo, useState } from 'react'
import { KeyViewport } from './components/KeyViewport'
import { ShapeIcon } from './components/ShapeIcon'
import {
  generatePuzzle,
  opensDoor,
  pairContains,
  transferFaces,
} from './logic/puzzle'
import type { Face, KeyPair, PendingDissect } from './types'
import { FACE_LABEL, FACE_ORDER } from './types'
import './App.css'

function freshPool(): Face[] {
  return [...FACE_ORDER]
}

export default function App() {
  const initial = useMemo(() => generatePuzzle(true), [])
  const [requireDoorSymbol, setRequireDoorSymbol] = useState(true)
  const [doors, setDoors] = useState<Face[]>(initial.doors)
  const [keys, setKeys] = useState<KeyPair[]>(initial.keys)
  const [pool, setPool] = useState<Face[]>(freshPool)
  const [selectedFace, setSelectedFace] = useState<Face | null>(null)
  const [pending, setPending] = useState<PendingDissect | null>(null)
  const [message, setMessage] = useState('Pick a shape, then Dissect.')

  const openFlags = useMemo(
    () => keys.map((k, i) => opensDoor(k, doors[i])),
    [keys, doors],
  )
  const solved = openFlags.every(Boolean)

  function newPuzzle(nextRequire = requireDoorSymbol) {
    const puzzle = generatePuzzle(nextRequire)
    setDoors(puzzle.doors)
    setKeys(puzzle.keys)
    setPool(freshPool())
    setSelectedFace(null)
    setPending(null)
    setMessage('Pick a shape, then Dissect.')
  }

  function refreshPool() {
    setPool(freshPool())
    setSelectedFace(null)
    setMessage('Pool refreshed.')
  }

  function consumeFace(face: Face) {
    setPool((prev) => {
      const idx = prev.indexOf(face)
      if (idx === -1) return prev
      return prev.filter((_, i) => i !== idx)
    })
  }

  function onPickFace(face: Face) {
    if (!pool.includes(face)) return
    setSelectedFace(face)
    setMessage(
      pending
        ? `${FACE_LABEL[face]} → Dissect on another key`
        : `${FACE_LABEL[face]} → Dissect`,
    )
  }

  function onDissectKey(index: number) {
    if (selectedFace === null) {
      setMessage('Pick a shape first.')
      return
    }
    if (!pool.includes(selectedFace)) {
      setMessage('Shape missing — refresh pool.')
      return
    }
    if (!pairContains(keys[index], selectedFace)) {
      setMessage(`No ${FACE_LABEL[selectedFace]} on this key.`)
      return
    }

    if (pending) {
      if (index === pending.keyIndex) {
        setMessage('Dissect a different key.')
        return
      }

      const next = transferFaces(
        keys,
        pending.keyIndex,
        pending.face,
        index,
        selectedFace,
      )
      if (!next) {
        setMessage('Exchange failed.')
        return
      }

      consumeFace(selectedFace)
      setKeys(next)
      setPending(null)
      setSelectedFace(null)
      setMessage(
        `Exchanged ${FACE_LABEL[pending.face]} ↔ ${FACE_LABEL[selectedFace]}`,
      )
      return
    }

    const face = selectedFace
    consumeFace(face)
    setPending({ keyIndex: index, face })
    setSelectedFace(null)
    setMessage(`Holding ${FACE_LABEL[face]} — pick shape & Dissect another key`)
  }

  function cancelPending() {
    if (!pending) return
    setPool((prev) => {
      const next = [...prev, pending.face]
      return FACE_ORDER.filter((face) => next.includes(face))
    })
    setPending(null)
    setSelectedFace(null)
    setMessage('Cancelled.')
  }

  return (
    <div className="app">
      <main className="stage">
        <header className="header">
          <h1 title="Open each door with a key that has none of that door's shape">
            Shapes
          </h1>
          <div className="header-actions">
            <label
              className="toggle"
              title="Each starting key includes its door's shape"
            >
              <input
                type="checkbox"
                checked={requireDoorSymbol}
                onChange={(e) => {
                  const next = e.target.checked
                  setRequireDoorSymbol(next)
                  newPuzzle(next)
                }}
              />
              <span>Door symbols</span>
            </label>
            <button
              type="button"
              className="btn ghost"
              onClick={() => newPuzzle()}
              title="Generate a new puzzle"
            >
              New
            </button>
            <details className="help">
              <summary title="Combinations">?</summary>
              <ul>
                <li>T+T Pyramid</li>
                <li>T+C Cone</li>
                <li>T+S Prism</li>
                <li>S+S Cube</li>
                <li>S+C Cylinder</li>
                <li>C+C Sphere</li>
              </ul>
            </details>
          </div>
        </header>

        <section className="pool-row" aria-label="Shape pool">
          <div className="pool-shapes">
            {FACE_ORDER.map((face) => {
              const available = pool.includes(face)
              return (
                <ShapeIcon
                  key={face}
                  face={face}
                  size={52}
                  selected={selectedFace === face}
                  disabled={!available}
                  onClick={() => onPickFace(face)}
                  title={FACE_LABEL[face]}
                />
              )
            })}
          </div>
          <button
            type="button"
            className="btn refresh"
            onClick={refreshPool}
            title="Refresh pool shapes"
          >
            ↻
          </button>
          {pending && (
            <button
              type="button"
              className="btn ghost"
              onClick={cancelPending}
              title="Cancel current dissect"
            >
              Cancel
            </button>
          )}
          <p className="status" title={message}>
            {message}
          </p>
        </section>

        <section className="keys-row" aria-label="Keys">
          {keys.map((pair, i) => (
            <KeyViewport
              key={`${i}-${pair.join('-')}`}
              pair={pair}
              door={doors[i]}
              open={openFlags[i]}
              pending={pending?.keyIndex === i}
              dissectDisabled={selectedFace === null}
              onDissect={() => onDissectKey(i)}
            />
          ))}
        </section>

        {solved && (
          <div className="win-banner" role="status">
            All doors open
          </div>
        )}
      </main>
    </div>
  )
}
