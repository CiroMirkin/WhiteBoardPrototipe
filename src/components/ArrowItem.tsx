import { useState } from 'react'
import type { Arrow } from '../types'

interface ArrowItemProps {
    arrow: Arrow
    onSelect: (id: string) => void
    onEndpointDrag: (id: string, endpoint: 'start' | 'end', x: number, y: number) => void
    onArrowDrag: (id: string, dx: number, dy: number) => void
    onContextMenu?: (e: React.MouseEvent) => void
    zoom: number
    panX: number
    panY: number
}

export const ArrowItem = ({ arrow, onSelect, onEndpointDrag, onArrowDrag, onContextMenu, zoom, panX, panY }: ArrowItemProps) => {
    const [draggingEndpoint, setDraggingEndpoint] = useState<'start' | 'end' | null>(null)

    const handleEndpointMouseDown = (e: React.MouseEvent, endpoint: 'start' | 'end') => {
        e.stopPropagation()
        e.preventDefault()
        setDraggingEndpoint(endpoint)
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
            const canvasX = (moveEvent.clientX - panX) / zoom
            const canvasY = (moveEvent.clientY - panY) / zoom
            onEndpointDrag(arrow.id, endpoint, canvasX, canvasY)
        }
        
        const handleMouseUp = () => {
            setDraggingEndpoint(null)
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
        
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }

    const handleLineMouseDown = (e: React.MouseEvent) => {
        if (draggingEndpoint) return
        e.stopPropagation()
        e.preventDefault()
        
        const startX = e.clientX
        const startY = e.clientY
        const origX2 = arrow.x2
        const origY2 = arrow.y2
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = (moveEvent.clientX - startX) / zoom
            const dy = (moveEvent.clientY - startY) / zoom
            
            if (e.shiftKey) {
                onEndpointDrag(arrow.id, 'end', origX2 + dx, origY2 + dy)
            } else {
                onArrowDrag(arrow.id, dx, dy)
            }
        }
        
        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
        
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }

    return (
        <g onContextMenu={(e) => {
            e.preventDefault()
            onContextMenu?.(e)
        }}>
            <line
                x1={arrow.x1}
                y1={arrow.y1}
                x2={arrow.x2}
                y2={arrow.y2}
                stroke="transparent"
                strokeWidth={20}
                style={{ 
                    cursor: 'move',
                    pointerEvents: draggingEndpoint ? 'none' : 'stroke'
                }}
                onClick={(e) => {
                    e.stopPropagation()
                    onSelect(arrow.id)
                }}
                onMouseDown={handleLineMouseDown}
            />
            <line
                x1={arrow.x1}
                y1={arrow.y1}
                x2={arrow.x2}
                y2={arrow.y2}
                stroke={arrow.selected ? '#3b82f6' : '#ef4444'}
                strokeWidth={2}
                markerEnd={arrow.selected ? "url(#arrowhead-selected)" : "url(#arrowhead)"}
                style={{ 
                    pointerEvents: 'none'
                }}
            />
            {arrow.selected && (
                <>
                    <circle
                        cx={arrow.x1}
                        cy={arrow.y1}
                        r={12}
                        fill="transparent"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        strokeDasharray="4 2"
                        style={{ cursor: 'move', pointerEvents: 'all' }}
                        onClick={(e) => {
                            e.stopPropagation()
                            onSelect(arrow.id)
                        }}
                        onMouseDown={(e) => handleEndpointMouseDown(e, 'start')}
                    />
                    <circle
                        cx={arrow.x2}
                        cy={arrow.y2}
                        r={12}
                        fill="transparent"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        strokeDasharray="4 2"
                        style={{ cursor: 'move', pointerEvents: 'all' }}
                        onClick={(e) => {
                            e.stopPropagation()
                            onSelect(arrow.id)
                        }}
                        onMouseDown={(e) => handleEndpointMouseDown(e, 'end')}
                    />
                </>
            )}
        </g>
    )
}
