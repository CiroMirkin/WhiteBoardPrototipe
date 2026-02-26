import { useState, useRef, useEffect } from 'react'
import './crop.css'

interface CropOverlayProps {
    imageSrc: string
    imageWidth: number
    imageHeight: number
    initialCrop?: {
        x: number
        y: number
        width: number
        height: number
        naturalWidth?: number
        naturalHeight?: number
    }
    onCrop: (crop: { x: number; y: number; width: number; height: number; naturalWidth: number; naturalHeight: number }) => void
    onClose: () => void
}

type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

export const CropOverlay = ({ imageSrc, imageWidth, imageHeight, initialCrop, onCrop, onClose }: CropOverlayProps) => {
    const [dimensions, setDimensions] = useState({ width: imageWidth, height: imageHeight })
    const [crop, setCrop] = useState({ x: 0, y: 0, width: imageWidth, height: imageHeight })
    const imageRef = useRef<HTMLImageElement>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const isDraggingRef = useRef(false)
    const dragStartRef = useRef({ x: 0, y: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 })

    useEffect(() => {
        if (imageRef.current && imageRef.current.complete) {
            const img = imageRef.current
            setDimensions({ width: img.offsetWidth, height: img.offsetHeight })
            if (initialCrop) {
                setCrop(initialCrop)
            } else {
                setCrop({ x: 0, y: 0, width: img.offsetWidth, height: img.offsetHeight })
            }
        }
    }, [imageSrc, initialCrop])

    const handleImageLoad = () => {
        if (imageRef.current) {
            const img = imageRef.current
            setDimensions({ width: img.offsetWidth, height: img.offsetHeight })
            if (!initialCrop) {
                setCrop({ x: 0, y: 0, width: img.offsetWidth, height: img.offsetHeight })
            }
        }
    }

    const handleMouseDown = (e: React.MouseEvent, handle: HandlePosition) => {
        e.preventDefault()
        e.stopPropagation()
        isDraggingRef.current = true

        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            cropX: crop.x,
            cropY: crop.y,
            cropW: crop.width,
            cropH: crop.height
        }

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!isDraggingRef.current || !wrapperRef.current) return

            const dx = moveEvent.clientX - dragStartRef.current.x
            const dy = moveEvent.clientY - dragStartRef.current.y

            const newCrop = { ...dragStartRef.current }

            switch (handle) {
                case 'nw':
                    newCrop.cropX = Math.max(0, Math.min(dragStartRef.current.cropX + dx, dragStartRef.current.cropX + dragStartRef.current.cropW - 20))
                    newCrop.cropY = Math.max(0, Math.min(dragStartRef.current.cropY + dy, dragStartRef.current.cropY + dragStartRef.current.cropH - 20))
                    newCrop.cropW = Math.max(20, dragStartRef.current.cropW - dx)
                    newCrop.cropH = Math.max(20, dragStartRef.current.cropH - dy)
                    break
                case 'n':
                    newCrop.cropY = Math.max(0, Math.min(dragStartRef.current.cropY + dy, dragStartRef.current.cropY + dragStartRef.current.cropH - 20))
                    newCrop.cropH = Math.max(20, dragStartRef.current.cropH - dy)
                    break
                case 'ne':
                    newCrop.cropY = Math.max(0, Math.min(dragStartRef.current.cropY + dy, dragStartRef.current.cropY + dragStartRef.current.cropH - 20))
                    newCrop.cropW = Math.max(20, Math.min(dragStartRef.current.cropW + dx, dimensions.width - newCrop.cropX))
                    newCrop.cropH = Math.max(20, dragStartRef.current.cropH - dy)
                    break
                case 'e':
                    newCrop.cropW = Math.max(20, Math.min(dragStartRef.current.cropW + dx, dimensions.width - dragStartRef.current.cropX))
                    break
                case 'se':
                    newCrop.cropW = Math.max(20, Math.min(dragStartRef.current.cropW + dx, dimensions.width - dragStartRef.current.cropX))
                    newCrop.cropH = Math.max(20, Math.min(dragStartRef.current.cropH + dy, dimensions.height - dragStartRef.current.cropY))
                    break
                case 's':
                    newCrop.cropH = Math.max(20, Math.min(dragStartRef.current.cropH + dy, dimensions.height - dragStartRef.current.cropY))
                    break
                case 'sw':
                    newCrop.cropX = Math.max(0, Math.min(dragStartRef.current.cropX + dx, dragStartRef.current.cropX + dragStartRef.current.cropW - 20))
                    newCrop.cropW = Math.max(20, dragStartRef.current.cropW - dx)
                    newCrop.cropH = Math.max(20, Math.min(dragStartRef.current.cropH + dy, dimensions.height - dragStartRef.current.cropY))
                    break
                case 'w':
                    newCrop.cropX = Math.max(0, Math.min(dragStartRef.current.cropX + dx, dragStartRef.current.cropX + dragStartRef.current.cropW - 20))
                    newCrop.cropW = Math.max(20, dragStartRef.current.cropW - dx)
                    break
            }

            setCrop({ x: newCrop.cropX, y: newCrop.cropY, width: newCrop.cropW, height: newCrop.cropH })
        }

        const handleMouseUp = () => {
            isDraggingRef.current = false
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    const handleAccept = () => {
        onCrop({
            ...crop,
            naturalWidth: dimensions.width,
            naturalHeight: dimensions.height
        })
    }

    const handles: HandlePosition[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

    return (
        <div className="crop-overlay" onClick={onClose}>
            <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
                <div className="crop-header">
                    <h3>Recortar imagen</h3>
                    <button className="crop-close" onClick={onClose}>&times;</button>
                </div>
                <div className="crop-container">
                    <div 
                        className="crop-image-wrapper" 
                        ref={wrapperRef}
                    >
                        <img
                            ref={imageRef}
                            src={imageSrc}
                            alt="Crop"
                            className="crop-image"
                            draggable={false}
                            onLoad={handleImageLoad}
                        />
                        <div
                            className="crop-selection"
                            style={{
                                left: crop.x,
                                top: crop.y,
                                width: crop.width,
                                height: crop.height,
                            }}
                        >
                            {handles.map((handle) => (
                                <div
                                    key={handle}
                                    className={`crop-handle crop-handle-${handle}`}
                                    onMouseDown={(e) => handleMouseDown(e, handle)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="crop-footer">
                    <button className="crop-btn crop-btn-cancel" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="crop-btn crop-btn-accept" onClick={handleAccept}>
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    )
}
