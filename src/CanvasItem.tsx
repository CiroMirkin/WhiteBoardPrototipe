import React from 'react'
import type { CanvasImage } from './types'

interface CanvasItemProps {
  item: CanvasImage
  isDragging: boolean
  onItemClick: (id: string) => void
  onItemDragStart: (id: string) => void
}

export const CanvasItem: React.FC<CanvasItemProps> = ({ item, isDragging, onItemClick, onItemDragStart }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${item.x}px`,
    top: `${item.y}px`,
    zIndex: item.zIndex,
    opacity: isDragging ? 0.25 : 1,
    cursor: 'grab',
    borderRadius: '4px',
  }

  const handleDragStart = (e: React.DragEvent) => {
    const target = e.target as HTMLElement
    e.dataTransfer.setData('image-id', item.id)
    onItemDragStart(item.id)

    const rect = target.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    e.dataTransfer.setData('offset-x', offsetX.toString())
    e.dataTransfer.setData('offset-y', offsetY.toString())
    e.dataTransfer.setDragImage(target, offsetX, offsetY)
  }

  if (item.type !== 'text') {
    return (
      <img
        onClick={() => onItemClick(item.id)}
        key={item.id}
        src={item.src}
        draggable
        onDragStart={handleDragStart}
        style={{
          ...style,
          width: '200px',
          border: '2px solid white',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
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
        draggable
        onDragStart={handleDragStart}
      >
        {item.value}
      </p>
    )
  }
}