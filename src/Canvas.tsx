import { forwardRef, useRef, useCallback, useEffect, useState, lazy, Suspense } from 'react'
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
import { useArrowDrawing } from './hooks/useArrowDrawing'
import { ArrowItem } from './components/ArrowItem'
import { updateItemCrop } from './utils/canvasUtils'

const CropOverlay = lazy(() => import('./components/CropOverlay').then(module => ({ default: module.CropOverlay })))

interface CanvasProps {
    activeTool?: 'select' | 'text' | 'image' | 'arrow'
    onToolChange?: (tool: 'select' | 'text' | 'image' | 'arrow') => void
}

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(({ activeTool = 'select', onToolChange }, ref) => {
    const { uploadedFiles, setUploadedFiles, arrows, setArrows, addArrow, updateArrow, removeArrow } = useFiles()
    const { zoom, setZoom, panX, panY, setPan } = useZoom()
    const localRef = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef(new Map<string, HTMLElement>())
    const THROTTLE_MS = 8 // ~120fps
    const [croppingItem, setCroppingItem] = useState<CanvasImage | null>(null)

    const { draggingId, handleItemMouseDown, handleDragMouseMove, handleDragMouseUp } = useItemDragging(
        uploadedFiles, setUploadedFiles, zoom, panX, panY, localRef, itemRefs, THROTTLE_MS
    )
    const { isPanning, handlePanMouseDown, handlePanMouseMove, handlePanMouseUp } = useCanvasPanning(zoom, panX, panY, setPan)
    const { resizingId, setResizingId, handleResizeWheel, handleResizeStart } = useItemResizing(uploadedFiles, setUploadedFiles, itemRefs, zoom, panX)
    const { handleZoomWheel } = useCanvasZooming(zoom, panX, panY, setZoom, setPan, localRef)
    useItemKeyboardShortcuts(uploadedFiles, setUploadedFiles, itemRefs)

    const { isDrawing, currentArrow, handleMouseDown: handleArrowMouseDown, handleMouseMove: handleArrowMouseMove, handleMouseUp: handleArrowMouseUp } = useArrowDrawing({
        zoom,
        panX,
        panY,
        addArrow,
        isArrowMode: activeTool === 'arrow'
    })

    const handleArrowSelect = useCallback((id: string) => {
        setArrows(prev => prev.map(a => ({ ...a, selected: a.id === id })))
    }, [setArrows])

    const handleArrowEndpointDrag = useCallback((id: string, endpoint: 'start' | 'end', x: number, y: number) => {
        if (endpoint === 'start') {
            updateArrow(id, { x1: x, y1: y })
        } else {
            updateArrow(id, { x2: x, y2: y })
        }
    }, [updateArrow])

    const handleArrowDrag = useCallback((id: string, dx: number, dy: number) => {
        setArrows(prev => prev.map(a => {
            if (a.id !== id) return a
            return {
                ...a,
                x1: a.x1 + dx,
                y1: a.y1 + dy,
                x2: a.x2 + dx,
                y2: a.y2 + dy
            }
        }))
    }, [setArrows])

    const handleCanvasClick = useCallback(() => {
        if (activeTool === 'select') {
            setArrows(prev => prev.map(a => ({ ...a, selected: false })))
        }
    }, [activeTool, setArrows])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const selectedArrow = arrows.find(a => a.selected)
                if (selectedArrow) {
                    removeArrow(selectedArrow.id)
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [arrows, removeArrow])

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

    const handleDownload = (id: string) => {
        const item = uploadedFiles.find(f => f.id === id)
        if (item && item.src) {
            const link = document.createElement('a')
            link.href = item.src
            link.download = `item-${id}.png`
            link.click()
        }
    }

    const handleItemMouseDownWrapper = useCallback((id: string, clientX: number, clientY: number) => {
        if (activeTool !== 'select') return
        handleItemMouseDown(id, clientX, clientY)
    }, [activeTool, handleItemMouseDown])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (activeTool === 'arrow') {
            handleArrowMouseDown(e)
        } else {
            handlePanMouseDown(e)
        }
    }, [activeTool, handleArrowMouseDown, handlePanMouseDown])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (activeTool === 'arrow' && isDrawing) {
            handleArrowMouseMove(e)
        } else {
            handlePanMouseMove(e)
            handleDragMouseMove(e)
        }
    }, [activeTool, isDrawing, handleArrowMouseMove, handlePanMouseMove, handleDragMouseMove])

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        if (activeTool === 'arrow' && isDrawing) {
            handleArrowMouseUp()
        } else {
            handlePanMouseUp(e)
            handleDragMouseUp()
        }
    }, [activeTool, isDrawing, handleArrowMouseUp, handlePanMouseUp, handleDragMouseUp])

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
        if (!localRef.current) return
        
        const originalZoom = zoom
        const originalPanX = panX
        const originalPanY = panY
        
        setZoom(1)
        setPan(0, 0)
        
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const html2canvas = (await import('html2canvas')).default
        
        const canvas = await html2canvas(localRef.current, { 
            useCORS: true, 
            scale: 3,
            backgroundColor: '#ffffff',
        })
        
        setZoom(originalZoom)
        setPan(originalPanX, originalPanY)
        
        const link = document.createElement('a')
        link.download = 'whiteboard-full.png'
        link.href = canvas.toDataURL('image/png')
        link.click()
    }

    const handleDelete = (id: string) => {
        const isArrow = arrows.some(a => a.id === id)
        if (isArrow) {
            removeArrow(id)
        } else {
            setUploadedFiles(prev => prev.filter(img => img.id !== id))
        }
    }

    const handleCrop = (id: string) => {
        const item = uploadedFiles.find(img => img.id === id)
        if (item) {
            setCroppingItem(item)
        }
    }

    const handleCropApply = (crop: { x: number; y: number; width: number; height: number; naturalWidth: number; naturalHeight: number }) => {
        if (croppingItem) {
            updateItemCrop(setUploadedFiles, croppingItem.id, crop)
            setCroppingItem(null)
        }
    }

    const handleCropClose = () => {
        setCroppingItem(null)
    }

    const handleContextMenuClose = (e?: React.MouseEvent) => {
        if (resizingId && e) { 
            const target = e.target as HTMLElement
            const resizingEl = itemRefs.current.get(resizingId)
            if (resizingEl && !resizingEl.contains(target)) { 
                setResizingId(null) 
            } 
        } 
    }

    return (
        <>
        <CanvasContextMenu
            onDelete={handleDelete}
            onResize={(id) => setResizingId(id)}
            onClose={handleContextMenuClose}
            onDownload={handleDownload}
            onCrop={handleCrop}
            isImageFn={(id) => !!uploadedFiles.find(f => f.id === id)?.src}
            isArrowFn={(id) => arrows.some(a => a.id === id)}
        >
            {(showMenu, closeMenu) => (
                <div
                    ref={(el) => { localRef.current = el; if (el) (el as unknown as HTMLElement & { downloadBoard: () => void }).downloadBoard = downloadBoard; if (ref && typeof ref !== 'function') ref.current = el; }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onClick={(e) => { closeMenu(e); handleCanvasClick() }}
                    onDoubleClick={() => activeTool === 'arrow' && onToolChange?.('select')}
                    className={`viewport ${isPanning || draggingId ? 'active' : ''}`}
                    style={{ cursor: activeTool === 'arrow' ? 'crosshair' : undefined }}
                >
                    <div
                        ref={innerRef}
                        className="canvas"
                        style={{
                            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                        }}
                    >
                        <svg 
                            className="arrows-layer"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    handleCanvasClick()
                                }
                            }}
                        >
                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                                </marker>
                                <marker id="arrowhead-selected" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                                </marker>
                            </defs>
                            {arrows.map(arrow => (
                                <ArrowItem
                                    key={arrow.id}
                                    arrow={arrow}
                                    onSelect={handleArrowSelect}
                                    onEndpointDrag={handleArrowEndpointDrag}
                                    onArrowDrag={handleArrowDrag}
                                    onContextMenu={(e) => showMenu(arrow.id, e.clientX, e.clientY)}
                                    zoom={zoom}
                                    panX={panX}
                                    panY={panY}
                                />
                            ))}
                            {currentArrow && (
                                <line
                                    x1={currentArrow.x1}
                                    y1={currentArrow.y1}
                                    x2={currentArrow.x2}
                                    y2={currentArrow.y2}
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    markerEnd="url(#arrowhead)"
                                />
                            )}
                        </svg>
                        {uploadedFiles.map((file: CanvasImage) => (
                            <CanvasItem
                                key={file.id}
                                item={file}
                                isDragging={draggingId === file.id}
                                isResizing={resizingId === file.id}
                                onItemClick={handleImageClick}
                                onItemMouseDown={handleItemMouseDownWrapper}
                                onContextMenu={showMenu}
                                refCallback={refCallback}
                                onResizeStart={(position, e) => handleResizeStart(file.id, position, e.clientX, e.clientY)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </CanvasContextMenu>
        {croppingItem && (
            <Suspense fallback={null}>
                <CropOverlay
                    imageSrc={croppingItem.src || ''}
                    imageWidth={croppingItem.width || 200}
                    imageHeight={croppingItem.height || 100}
                    initialCrop={croppingItem.crop}
                    onCrop={handleCropApply}
                    onClose={handleCropClose}
                />
            </Suspense>
        )}
        </>
    )
})
