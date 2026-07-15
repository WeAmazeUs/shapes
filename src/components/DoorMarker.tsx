import type { Face } from '../types'
import { DOOR_MARK_COLOR, FACE_COLOR, FACE_LABEL } from '../types'

interface DoorMarkerProps {
  face: Face
  open: boolean
  size?: number
}

export function DoorMarker({ face, open, size = 56 }: DoorMarkerProps) {
  const color = FACE_COLOR[face]
  const mark = open ? '✓' : '✗'
  const status = open ? 'open' : 'closed'
  const title = `${FACE_LABEL[face]} door — ${status}`
  const markColor = open ? DOOR_MARK_COLOR.open : DOOR_MARK_COLOR.closed

  return (
    <div
      className={`door-marker ${status}`}
      title={title}
      aria-label={title}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
        {face === 'circle' && <circle cx="20" cy="20" r="16" fill={color} />}
        {face === 'triangle' && (
          <polygon points="20,3 37,36 3,36" fill={color} />
        )}
        {face === 'square' && (
          <rect x="5" y="5" width="30" height="30" rx="2" fill={color} />
        )}
        <text
          x="20"
          y={face === 'triangle' ? '26' : '22'}
          textAnchor="middle"
          dominantBaseline="middle"
          className="door-mark"
          fill={markColor}
          fontSize="16"
          fontWeight="800"
        >
          {mark}
        </text>
      </svg>
    </div>
  )
}
