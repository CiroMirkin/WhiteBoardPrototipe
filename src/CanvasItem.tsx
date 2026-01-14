import React from 'react'
import type { CanvasImage } from './types'

interface CanvasItemProps {
  item: CanvasImage
  isDragging: boolean
  onItemClick: (id: string) => void
  onItemMouseDown: (id: string, clientX: number, clientY: number) => void
}

export const CanvasItem: React.FC<CanvasItemProps> = ({ item, isDragging, onItemClick, onItemMouseDown }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${item.x}px`,
    top: `${item.y}px`,
    zIndex: item.zIndex,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    borderRadius: '4px',
    transition: isDragging ? 'none' : 'opacity 0.1s ease-out',
    transform: isDragging ? 'scale(1.05)' : 'scale(1)',
    transformOrigin: 'center',
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    onItemMouseDown(item.id, e.clientX, e.clientY)
  }

  if (item.type !== 'text') {
    return (
      <img
        onClick={() => onItemClick(item.id)}
        onMouseDown={handleMouseDown}
        key={item.id}
        src={item.src}
        style={{
          ...style,
          width: '200px',
          border: '2px solid white',
          boxShadow: isDragging ? '0 12px 24px rgba(0,0,0,0.3)' : '0 8px 16px rgba(0,0,0,0.15)',
        }}
      />
    )
  } else {
    return (
      <p
        key={item.id}
        style={{
          ...style,
          padding: '0 4px',
          width: 'auto',
          backgroundColor: 'rgba(0,0,0,0.15)',
          color: '#000',
          fontWeight: '700',
          fontSize: '2.5ch',
        }}
        onClick={() => onItemClick(item.id)}
        onMouseDown={handleMouseDown}
      >
        {item.value}
      </p>
    )
  }
}