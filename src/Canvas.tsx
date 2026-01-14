import { useRef, useState } from 'react'
import { useFiles } from './useFiles'
import type { CanvasImage } from './types'
import { useZoom } from './useZoom'
import { CanvasItem } from './CanvasItem'

export function Canvas() {
    const { uploadedFiles, setUploadedFiles } = useFiles()
    const { zoom } = useZoom()
    const [dragging, setDragging] = useState({
        state: false,
        imageId: '',
    })
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

    return (
        <div
            ref={canvasRef}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#f0f0f0' }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    transition: 'transform 0.2s ease-out',
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
