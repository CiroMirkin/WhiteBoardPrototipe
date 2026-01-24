import { useRef, useCallback, useEffect, forwardRef } from 'react'
import { useFiles } from './useFiles'
import type { CanvasImage } from './types'
import { useZoom } from './Zoom/useZoom'
import { CanvasItem } from './CanvasItem'
import { CanvasContextMenu } from './ContextMenu/CanvasContextMenu'
import { useItemDragging } from './hooks/useItemDragging'
import { useCanvasPanning } from './hooks/useCanvasPanning'
import { useItemResizing } from './hooks/useItemResizing'
import { useCanvasZooming } from './hooks/useCanvasZooming'
import { useItemKeyboardShortcuts } from './hooks/useItemKeyboardShortcuts'


export const Canvas = forwardRef<HTMLDivElement>((_, ref) => {
    const { uploadedFiles, setUploadedFiles } = useFiles()
    const { zoom, setZoom, panX, panY, setPan } = useZoom()
    const localRef = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef(new Map<string, HTMLElement>())
    const THROTTLE_MS = 8 // ~120fps

    const { draggingId, handleItemMouseDown, handleDragMouseMove, handleDragMouseUp } = useItemDragging(
        uploadedFiles, setUploadedFiles, zoom, panX, panY, localRef, itemRefs, THROTTLE_MS
    )
    const { isPanning, handlePanMouseDown, handlePanMouseMove, handlePanMouseUp } = useCanvasPanning(zoom, panX, panY, setPan)
    const { resizingId, setResizingId, handleResizeWheel } = useItemResizing(uploadedFiles, setUploadedFiles, itemRefs)
    const { handleZoomWheel } = useCanvasZooming(zoom, panX, panY, setZoom, setPan, localRef)
    useItemKeyboardShortcuts(uploadedFiles, setUploadedFiles, itemRefs)

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

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        handlePanMouseDown(e)
    }, [handlePanMouseDown])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        handlePanMouseMove(e)
        handleDragMouseMove(e)
    }, [handlePanMouseMove, handleDragMouseMove])

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        handlePanMouseUp(e)
        handleDragMouseUp()
    }, [handlePanMouseUp, handleDragMouseUp])

    const handleWheel = useCallback((e: Event) => {
        if (resizingId) {
            handleResizeWheel(e as WheelEvent)
        } else {
            handleZoomWheel(e)
        }
    }, [resizingId, handleResizeWheel, handleZoomWheel])

    useEffect(() => {
        const canvas = localRef.current
        if (canvas) {
            canvas.addEventListener('wheel', handleWheel, { passive: false })
        }
        return () => {
            if (canvas) {
                canvas.removeEventListener('wheel', handleWheel)
            }
        }
    }, [handleWheel])



    const downloadBoard = async () => {
        if (!localRef.current || !innerRef.current) return
        // Calculate bounds of all items
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        uploadedFiles.forEach(item => {
            minX = Math.min(minX, item.x)
            minY = Math.min(minY, item.y)
            maxX = Math.max(maxX, item.x + (item.width || 100))
            maxY = Math.max(maxY, item.y + (item.height || 100))
        })
        if (uploadedFiles.length === 0) {
            minX = 0; minY = 0; maxX = 100; maxY = 100
        }
        const padding = 100
        const width = maxX - minX + 2 * padding
        const height = maxY - minY + 2 * padding
        const originalWidth = localRef.current.style.width
        const originalHeight = localRef.current.style.height
        const originalInnerTransform = innerRef.current.style.transform
        // Store original transforms
        const originalTransforms: Map<string, string> = new Map()
        uploadedFiles.forEach(item => {
            const element = itemRefs.current.get(item.id)
            if (element) {
                originalTransforms.set(item.id, element.style.transform)
                element.style.transform = `translate(${item.x - minX + padding}px, ${item.y - minY + padding}px) ${item.zIndex === 1 ? 'scale(1.05)' : ''}`
            }
        })
        localRef.current.style.width = `${width}px`
        localRef.current.style.height = `${height}px`
        innerRef.current.style.transform = 'none'
        const html2canvas = await import('html2canvas')
        const canvas = await html2canvas.default(localRef.current, { useCORS: true, scale: 4 })
        // Restore
        localRef.current.style.width = originalWidth
        localRef.current.style.height = originalHeight
        innerRef.current.style.transform = originalInnerTransform
        uploadedFiles.forEach(item => {
            const element = itemRefs.current.get(item.id)
            if (element) {
                element.style.transform = originalTransforms.get(item.id) || ''
            }
        })
        const link = document.createElement('a')
        link.download = 'whiteboard-full.png'
        link.href = canvas.toDataURL('image/png')
        link.click()
    }

    const handleDelete = (id: string) => {
        setUploadedFiles(prev => prev.filter(img => img.id !== id))
    }

    const handleOnCloseCanvasContextMenu = (e?: React.MouseEvent) => { 
        if (resizingId && e) { 
            const target = e.target as HTMLElement
            const resizingEl = itemRefs.current.get(resizingId)
            if (resizingEl && !resizingEl.contains(target)) { 
                setResizingId(null) 
            } 
        } 
    }

    return (
        <CanvasContextMenu
            onDelete={handleDelete}
            onResize={(id) => setResizingId(id)}
            onClose={(e) => handleOnCloseCanvasContextMenu(e)}
        >
            {(showMenu, closeMenu) => (
                <div
                    ref={(el) => { localRef.current = el; if (el) (el as unknown as HTMLElement & { downloadBoard: () => void }).downloadBoard = downloadBoard; if (ref && typeof ref !== 'function') ref.current = el; }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onClick={(e) => closeMenu(e)}
                    style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#f0f0f0', cursor: isPanning ? 'grabbing' : draggingId ? 'grabbing' : 'default', userSelect: 'none' }}
                >
                    <div
                        ref={innerRef}
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
})
