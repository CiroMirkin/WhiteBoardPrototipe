import { useRef, useState, useCallback } from 'react'
import { useFiles } from './useFiles'
import type { CanvasImage } from './types'
import { useZoom } from './Zoom/useZoom'
import { CanvasItem } from './CanvasItem'
import { CanvasContextMenu } from './ContextMenu/CanvasContextMenu'

export function Canvas() {
    const { uploadedFiles, setUploadedFiles } = useFiles()
    const { zoom, panX, panY, setPan } = useZoom()
    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [isPanning, setIsPanning] = useState(false)
    const [lastMouseX, setLastMouseX] = useState(0)
    const [lastMouseY, setLastMouseY] = useState(0)
    const canvasRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef(new Map<string, HTMLElement>())
    const dragOffsetRef = useRef({ x: 0, y: 0 })
    const lastUpdateRef = useRef(0)
    const THROTTLE_MS = 8 // ~120fps
    const currentDragPosition = useRef({ x: 0, y: 0 })

    const updateItemPosition = useCallback((id: string, x: number, y: number) => {
        setUploadedFiles(prev =>
            prev.map(img => img.id === id ? { ...img, x, y } : img)
        )
    }, [setUploadedFiles])

    const refCallback = useCallback((id: string, el: HTMLElement | null) => {
        if (el) {
            itemRefs.current.set(id, el)
        } else {
            itemRefs.current.delete(id)
        }
    }, [])

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

        const element = itemRefs.current.get(id)
        if (element) {
            element.style.transform = `translate(${item.x}px, ${item.y}px) scale(1.05)`
            element.style.willChange = 'transform'
        }
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

            currentDragPosition.current = { x: newX, y: newY }

            const element = itemRefs.current.get(draggingId)
            if (element) {
                element.style.transform = `translate(${newX}px, ${newY}px) scale(1.05)`
            }
        }
    }, [isPanning, draggingId, lastMouseX, lastMouseY, zoom, panX, panY, setPan])

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        if (e.button === 1) {
            setIsPanning(false)
        }
        if (draggingId) {
            updateItemPosition(draggingId, currentDragPosition.current.x, currentDragPosition.current.y)
            setDraggingId(null)
        }
    }, [draggingId, updateItemPosition])

    const handleDelete = (id: string) => {
        setUploadedFiles(prev => prev.filter(img => img.id !== id))
    }

    return (
        <CanvasContextMenu onDelete={handleDelete}>
            {(showMenu, closeMenu) => (
                <div
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onClick={closeMenu}
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
                                onContextMenu={showMenu}
                                refCallback={refCallback}
                            />
                        ))}
                    </div>
                </div>
            )}
        </CanvasContextMenu>
    )
}
