import { useRef, useState } from 'react'
import { useFiles } from './useFiles'
import type { CanvasImage } from './types'
import { useZoom } from './Zoom/useZoom'
import { CanvasItem } from './CanvasItem'

export function Canvas() {
    const { uploadedFiles, setUploadedFiles } = useFiles()
    const { zoom, panX, panY, setPan } = useZoom()
    const [dragging, setDragging] = useState({
        state: false,
        imageId: '',
    })
    const [isPanning, setIsPanning] = useState(false)
    const [lastMouseX, setLastMouseX] = useState(0)
    const [lastMouseY, setLastMouseY] = useState(0)
    const canvasRef = useRef<HTMLDivElement>(null)

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const id = e.dataTransfer.getData('image-id')
        const offsetX = parseFloat(e.dataTransfer.getData('offset-x'))
        const offsetY = parseFloat(e.dataTransfer.getData('offset-y'))

        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect()
            const nextX = (e.clientX - rect.left - offsetX) / zoom
            const nextY = (e.clientY - rect.top - offsetY) / zoom

            setUploadedFiles(prev =>
                prev.map(img => (img.id === id ? { ...img, x: nextX, y: nextY, zIndex: 1 } : { ...img, zIndex: 0 }))
            )
            setDragging({ state: false, imageId: '' })
        }
    }

    const handleImageClick = (id: string) => {
        setUploadedFiles(prev =>
            prev.map(img => (img.id === id ? { ...img, zIndex: 1 } : { ...img, zIndex: 0 }))
        )
    }

    const handleItemDragStart = (id: string) => {
        setDragging({ state: true, imageId: id })
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 1) { // Middle mouse button
            setIsPanning(true)
            setLastMouseX(e.clientX)
            setLastMouseY(e.clientY)
            e.preventDefault()
        }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            const deltaX = (e.clientX - lastMouseX) / zoom
            const deltaY = (e.clientY - lastMouseY) / zoom
            setPan(panX + deltaX, panY + deltaY)
            setLastMouseX(e.clientX)
            setLastMouseY(e.clientY)
        }
    }

    const handleMouseUp = (e: React.MouseEvent) => {
        if (e.button === 1) {
            setIsPanning(false)
        }
    }

    return (
        <div
            ref={canvasRef}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#f0f0f0', cursor: isPanning ? 'grabbing' : 'default' }}
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
                        isDragging={dragging.state && dragging.imageId === file.id}
                        onItemClick={handleImageClick}
                        onItemDragStart={handleItemDragStart}
                    />
                ))}
            </div>
        </div>
    )
}
