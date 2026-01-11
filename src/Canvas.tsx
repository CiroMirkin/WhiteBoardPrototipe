import { useRef, useState } from 'react'
import { useFiles } from './useFiles'

export function Canvas() {
    const { uploadedFiles, setUploadedFiles } = useFiles()
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
            const nextX = e.clientX - rect.left - offsetX
            const nextY = e.clientY - rect.top - offsetY

            setUploadedFiles(prev =>
                prev.map(img => (img.id === id ? { ...img, x: nextX, y: nextY, zIndex: 1 } : {...img, zIndex: 0}))
            )
            setDragging({ state: false, imageId: '' })
        }
    }

    const handleImageClick = (id: string) => {
        setUploadedFiles(prev =>
            prev.map(img => (img.id === id ? { ...img, zIndex: 1 } : { ...img, zIndex: 0 }))
        )
    }

    return (
        <div
            ref={canvasRef}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            style={{ width: '100vw', height: '100vh', position: 'relative', backgroundColor: '#f0f0f0' }}
        >
            {uploadedFiles.map((img) => {
                return img.type !== 'text' ? (
                    <img
                        onClick={() => handleImageClick(img.id)}
                        key={img.id}
                        src={img.src}
                        draggable
                        onDragStart={(e) => {
                            const target = e.target as HTMLImageElement

                            e.dataTransfer.setData('image-id', img.id)
                            setDragging({ state: true, imageId: img.id })

                            const rect = (target).getBoundingClientRect()
                            const offsetX = e.clientX - rect.left
                            const offsetY = e.clientY - rect.top
                            e.dataTransfer.setData('offset-x', offsetX.toString())
                            e.dataTransfer.setData('offset-y', offsetY.toString())
                            e.dataTransfer.setDragImage(target, offsetX, offsetY)
                        }}
                        style={{
                            position: 'absolute', left: `${img.x}px`, top: `${img.y}px`,
                            width: '200px', cursor: 'grab', borderRadius: '4px', border: '2px solid white',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.15)', zIndex: `${img.zIndex}`,
                            opacity: `${dragging.state && dragging.imageId === img.id ? 0.25 : 1}`,

                        }}
                    />
                )
                : (
                    <p 
                        key={img.id} 
                        style={{
                        position: 'absolute', left: `${img.x}px`, top: `${img.y}px`,
                        padding: '0 4px', zIndex: `${img.zIndex}`,
                        width: 'auto', cursor: 'grab', borderRadius: '4px',
                        backgroundColor: 'rgba(0,0,0,0.15)',
                        color: '#000', fontWeight: '700', fontSize: '2.5ch',
                        opacity: `${dragging.state && dragging.imageId === img.id ? 0.25 : 1}`,
                        }} 
                        onClick={() => handleImageClick(img.id)}
                        draggable
                        onDragStart={(e) => {
                            const target = e.target as HTMLImageElement
                            e.dataTransfer.setData('image-id', img.id)
                            setDragging({ state: true, imageId: img.id })
                            const rect = (target).getBoundingClientRect()
                            const offsetX = e.clientX - rect.left
                            const offsetY = e.clientY - rect.top
                            e.dataTransfer.setData('offset-x', offsetX.toString())
                            e.dataTransfer.setData('offset-y', offsetY.toString())
                            e.dataTransfer.setDragImage(target, offsetX, offsetY)
                        }}
                    >{img.value}</p>
                )
            })}
        </div>
    )
}