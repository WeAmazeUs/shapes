import type { Face } from '../types'
import { FACE_COLOR } from '../types'

interface ShapeIconProps {
  face: Face
  size?: number
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  title?: string
  decorative?: boolean
  color?: string
}

function ShapeSvg({
  face,
  size,
  color,
}: {
  face: Face
  size: number
  color: string
}) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
      {face === 'circle' && <circle cx="20" cy="20" r="14" fill={color} />}
      {face === 'triangle' && <polygon points="20,5 35,33 5,33" fill={color} />}
      {face === 'square' && <rect x="7" y="7" width="26" height="26" fill={color} />}
    </svg>
  )
}

export function ShapeIcon({
  face,
  size = 56,
  selected = false,
  disabled = false,
  onClick,
  title,
  decorative = false,
  color,
}: ShapeIconProps) {
  const pad = 6
  const fill = color ?? FACE_COLOR[face]

  if (decorative || !onClick) {
    return (
      <span
        className="shape-icon decorative"
        title={title}
        style={{ width: size, height: size }}
      >
        <ShapeSvg face={face} size={size - pad} color={fill} />
      </span>
    )
  }

  return (
    <button
      type="button"
      className={`shape-icon${selected ? ' selected' : ''}${disabled ? ' disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{ width: size, height: size }}
    >
      <ShapeSvg face={face} size={size - pad} color={fill} />
    </button>
  )
}
