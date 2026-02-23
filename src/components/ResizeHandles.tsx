import React, { useCallback } from 'react'

export type HandlePosition = 'nw' | 'ne' | 'sw' | 'se'

interface ResizeHandlesProps {
  x: number
  y: number
  width: number
  height: number
  onResizeStart: (position: HandlePosition, e: React.MouseEvent) => void
}

const HANDLE_SIZE = 12

const HANDLE_OFFSET = HANDLE_SIZE / 2

const handleStyle: React.CSSProperties = {
  position: 'absolute',
  width: HANDLE_SIZE,
  height: HANDLE_SIZE,
  backgroundColor: 'white',
  border: '2px solid #0066ff',
  borderRadius: '2px',
  cursor: 'pointer',
  zIndex: 1000,
}

const HANDLE_POSITIONS: HandlePosition[] = ['nw', 'ne', 'sw', 'se']

const HANDLE_CURSORS: Record<HandlePosition, string> = {
  nw: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  se: 'nwse-resize',
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  x,
  y,
  width,
  height,
  onResizeStart,
}) => {
  const handleMouseDown = useCallback(
    (position: HandlePosition) => (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      onResizeStart(position, e)
    },
    [onResizeStart]
  )

  return (
    <>
      {HANDLE_POSITIONS.map((position) => (
        <div
          key={position}
          style={{
            ...handleStyle,
            cursor: HANDLE_CURSORS[position],
            left: (position.includes('e') ? x + width : x) - HANDLE_OFFSET,
            top: (position.includes('s') ? y + height : y) - HANDLE_OFFSET,
          }}
          onMouseDown={handleMouseDown(position)}
        />
      ))}
    </>
  )
}