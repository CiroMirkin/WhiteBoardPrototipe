import React from 'react'
import type { CanvasImage } from './types'
import { ResizeHandles, type HandlePosition } from './components/ResizeHandles'
import './styles/canvasItem.css'

interface CanvasItemProps {
  item: CanvasImage
  isDragging: boolean
  isResizing: boolean
  onItemClick: (id: string) => void
  onItemMouseDown: (id: string, clientX: number, clientY: number) => void
  onContextMenu: (id: string, x: number, y: number) => void
  refCallback: (id: string, el: HTMLElement | null) => void
  onResizeStart: (position: HandlePosition, e: React.MouseEvent) => void
}

export const CanvasItem: React.FC<CanvasItemProps> = ({ 
  item, 
  isDragging, 
  isResizing,
  onItemClick, 
  onItemMouseDown, 
  onContextMenu, 
  refCallback,
  onResizeStart 
}) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: item.zIndex,
    border: 'none',
    opacity: isDragging ? 0.9 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    transition: isDragging ? 'none' : 'opacity 0.1s ease-out',
    transform: `translate(${item.x}px, ${item.y}px) ${isDragging ? 'scale(1.05)' : 'scale(1)'}`,
    transformOrigin: 'center',
    willChange: isDragging ? 'transform' : 'auto',
    userSelect: 'none',
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault()
    onItemMouseDown(item.id, e.clientX, e.clientY)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onContextMenu(item.id, e.clientX, e.clientY)
  }

  const handleResizeStart = (position: HandlePosition, e: React.MouseEvent) => {
    e.stopPropagation()
    onResizeStart(position, e)
  }

  const width = item.width || 200
  const height = item.height || 100

  if (item.type !== 'text') {
    return (
      <div className="canvas-item-wrapper">
        <div
          ref={(el) => refCallback(item.id, el)}
          className={`canvas-item ${isDragging ? 'dragging' : ''}`}
          onClick={() => onItemClick(item.id)}
          onMouseDown={handleMouseDown}
          onContextMenu={handleContextMenu}
          style={{
            ...style,
            width,
            height: item.height || 'auto',
            filter: isDragging ? 'drop-shadow(0 12px 24px rgba(0,0,0,0.45))' : 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0))',
          }}
        >
          <img
            src={item.src}
            alt=""
          />
          {isResizing && (
            <ResizeHandles
              x={0}
              y={0}
              width={width}
              height={height}
              onResizeStart={handleResizeStart}
            />
          )}
        </div>
      </div>
    )
  } else {
    const textWidth = item.width || 200
    const textHeight = item.height || 40
    
    return (
      <div className="canvas-item-wrapper">
        <p
          ref={(el) => refCallback(item.id, el)}
          className={`canvas-item canvas-text ${isDragging ? 'dragging' : ''}`}
          onClick={() => onItemClick(item.id)}
          onMouseDown={handleMouseDown}
          onContextMenu={handleContextMenu}
          style={{
            ...style,
            width: 'auto',
            height: 'auto',
            padding: '0 5px',
            whiteSpace: 'nowrap',
            backgroundColor: 'rgba(0,0,0,0.15)',
            color: '#000',
            fontWeight: '700',
            fontSize: (item.fontSize || 20) + 'px',
          }}
        >
          {item.value}
          {isResizing && (
            <ResizeHandles
              x={0}
              y={0}
              width={textWidth}
              height={textHeight}
              onResizeStart={handleResizeStart}
            />
          )}
        </p>
      </div>
    )
  }
}
