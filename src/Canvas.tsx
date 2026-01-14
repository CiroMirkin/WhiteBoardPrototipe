import { useRef, useState, useCallback } from 'react'
import { useFiles } from './useFiles'
import type { CanvasImage } from './types'
import { useZoom } from './Zoom/useZoom'
import { CanvasItem } from './CanvasItem'

export function Canvas() {
    const { uploadedFiles, setUploadedFiles } = useFiles()
    const { zoom, panX, panY, setPan } = useZoom()
    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [isPanning, setIsPanning] = useState(false)
    const [lastMouseX, setLastMouseX] = useState(0)
    const [lastMouseY, setLastMouseY] = useState(0)
    const canvasRef = useRef<HTMLDivElement>(null)
    const dragOffsetRef = useRef({ x: 0, y: 0 })
    const lastUpdateRef = useRef(0)
    const THROTTLE_MS = 16 // ~60fps

    const updateItemPosition = useCallback((id: string, x: number, y: number) => {
        setUploadedFiles(prev =>
            prev.map(img => img.id === id ? { ...img, x, y } : img)
        )
    }, [setUploadedFiles])

    const handleImageClick = (id: string) => {
        if (draggingId) return // Prevent click during drag
        setUploadedFiles(prev =>
            prev.map(img => (img.id === id ? { ...img, zIndex: 1 } : { ...img, zIndex: 0 }))
        )
    }

    const handleItemMouseDown = (id: string, clientX: number, clientY: number) => {
        const item = uploadedFiles.find(img => img.id === id)
        if (!item || !canvasRef.current) return

        const rect = canvasRef.current.getBoundingClientRect()
        const canvasX = (clientX - rect.left) / zoom - panX
        const canvasY = (clientY - rect.top) / zoom - panY

        dragOffsetRef.current = {
            x: canvasX - item.x,
            y: canvasY - item.y
        }

        setDraggingId(id)
        setUploadedFiles(prev =>
            prev.map(img => (img.id === id ? { ...img, zIndex: 1 } : { ...img, zIndex: 0 }))
        )
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 1) { // Middle mouse button
            setIsPanning(true)
            setLastMouseX(e.clientX)
            setLastMouseY(e.clientY)
            e.preventDefault()
        }
    }

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isPanning) {
            const deltaX = (e.clientX - lastMouseX) / zoom
            const deltaY = (e.clientY - lastMouseY) / zoom
            setPan(panX + deltaX, panY + deltaY)
            setLastMouseX(e.clientX)
            setLastMouseY(e.clientY)
        } else if (draggingId && canvasRef.current) {
            const now = Date.now()
            if (now - lastUpdateRef.current < THROTTLE_MS) return
            lastUpdateRef.current = now

            const rect = canvasRef.current.getBoundingClientRect()
            const canvasX = (e.clientX - rect.left) / zoom - panX
            const canvasY = (e.clientY - rect.top) / zoom - panY

            const newX = canvasX - dragOffsetRef.current.x
            const newY = canvasY - dragOffsetRef.current.y

            updateItemPosition(draggingId, newX, newY)
        }
    }, [isPanning, draggingId, lastMouseX, lastMouseY, zoom, panX, panY, setPan, updateItemPosition])

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        if (e.button === 1) {
            setIsPanning(false)
        }
        if (draggingId) {
            setDraggingId(null)
        }
    }, [draggingId])

    return (
        <div
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#f0f0f0', cursor: isPanning ? 'grabbing' : draggingId ? 'grabbing' : 'default' }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                    transformOrigin: 'top left',
                    transition: isPanning ? 'none' : 'transform 0.2s ease-out',
                }}
            >
                {uploadedFiles.map((file: CanvasImage) => (
                    <CanvasItem
                        key={file.id}
                        item={file}
                        isDragging={draggingId === file.id}
                        onItemClick={handleImageClick}
                        onItemMouseDown={handleItemMouseDown}
                    />
                ))}
            </div>
        </div>
    )
}
