import { useRef } from 'react'
import { useFiles } from './useFiles'

export function Canvas() {
    const { uploadedFiles, setUploadedFiles } = useFiles()
    const canvasRef = useRef<HTMLDivElement>(null)

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const id = e.dataTransfer.getData('image-id')
        const offsetX = parseFloat(e.dataTransfer.getData('offset-x'))
        const offsetY = parseFloat(e.dataTransfer.getData('offset-y'))

        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect()
            const nextX = e.clientX - rect.left - offsetX
            const nextY = e.clientY - rect.top - offsetY

            setUploadedFiles(prev =>
                prev.map(img => (img.id === id ? { ...img, x: nextX, y: nextY } : img))
            )
        }
    }

    return (
        <div
            ref={canvasRef}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            style={{ width: '100vw', height: '100vh', position: 'relative', backgroundColor: '#f0f0f0' }}
        >
            {uploadedFiles.map((img) => (
                <img
                    key={img.id}
                    src={img.src}
                    draggable
                    onDragStart={(e) => {
                        e.dataTransfer.setData('image-id', img.id)
                        const rect = (e.target as HTMLImageElement).getBoundingClientRect()
                        e.dataTransfer.setData('offset-x', (e.clientX - rect.left).toString())
                        e.dataTransfer.setData('offset-y', (e.clientY - rect.top).toString())
                    }}
                    style={{
                        position: 'absolute', left: `${img.x}px`, top: `${img.y}px`,
                        width: '200px', cursor: 'grab', borderRadius: '4px', border: '2px solid white',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.15)', zIndex: 5
                    }}
                />
            ))}
        </div>
    )
}