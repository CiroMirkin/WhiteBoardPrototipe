import React from 'react'
import type { CanvasImage } from './types'

interface CanvasItemProps {
  item: CanvasImage
  isDragging: boolean
  onItemClick: (id: string) => void
  onItemMouseDown: (id: string, clientX: number, clientY: number) => void
  onContextMenu: (id: string, x: number, y: number) => void
  refCallback: (id: string, el: HTMLElement | null) => void
}

export const CanvasItem: React.FC<CanvasItemProps> = ({ item, isDragging, onItemClick, onItemMouseDown, onContextMenu, refCallback }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: item.zIndex,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    borderRadius: '4px',
    transition: isDragging ? 'none' : 'opacity 0.1s ease-out',
    transform: `translate(${item.x}px, ${item.y}px) ${isDragging ? 'scale(1.05)' : 'scale(1)'}`,
    transformOrigin: 'center',
    willChange: isDragging ? 'transform' : 'auto',
    userSelect: 'none',
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click for dragging
    e.preventDefault()
    onItemMouseDown(item.id, e.clientX, e.clientY)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onContextMenu(item.id, e.clientX, e.clientY)
  }

  if (item.type !== 'text') {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img
          ref={(el) => refCallback(item.id, el)}
          onClick={() => onItemClick(item.id)}
          onMouseDown={handleMouseDown}
          onContextMenu={handleContextMenu}
          key={item.id}
          src={item.src}
          style={{
            ...style,
            width: item.width || 200,
            height: item.height || 'auto',
            border: '2px solid white',
            boxShadow: isDragging ? '0 12px 24px rgba(0,0,0,0.3)' : '0 8px 16px rgba(0,0,0,0.15)',
          }}
        />
      </div>
    )
  } else {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <p
          ref={(el) => refCallback(item.id, el)}
          key={item.id}
          style={{
            ...style,
            padding: '0 4px',
            width: item.width || 'auto',
            height: item.height || 'auto',
            backgroundColor: 'rgba(0,0,0,0.15)',
            color: '#000',
            fontWeight: '700',
            fontSize: (item.fontSize || 20) + 'px',
          }}
          onClick={() => onItemClick(item.id)}
          onMouseDown={handleMouseDown}
          onContextMenu={handleContextMenu}
        >
          {item.value}
        </p>
      </div>
    )
  }
}