import { forwardRef, useRef, useCallback, useEffect, lazy, Suspense } from 'react'
import { useWhiteboardStore } from './store/useWhiteboardStore'
import type { CanvasImage } from './types'
import { useViewport } from './canvas/hooks/useViewport'
import { ArrowLayer } from './canvas/ArrowLayer'
import { CanvasItem } from './CanvasItem'
import { CanvasContextMenu } from './components/CanvasContextMenu'
import { useItemDragging } from './canvas/hooks/useItemDragging'
import { useItemResizing } from './canvas/hooks/useItemResizing'
import { useItemKeyboardShortcuts } from './canvas/hooks/useItemKeyboardShortcuts'
import { useArrowDrawing } from './canvas/hooks/useArrowDrawing'
import { useArrowKeyboardShortcuts } from './canvas/hooks/useArrowKeyboardShortcuts'
import { useCrop } from './features/crop/useCrop'
import { useCanvasExport } from './canvas/hooks/useCanvasExport'

const CropOverlay = lazy(() => import('./features/crop/CropOverlay').then(module => ({ default: module.CropOverlay })))

interface CanvasProps {
    activeTool?: 'select' | 'text' | 'image' | 'arrow'
    onToolChange?: (tool: 'select' | 'text' | 'image' | 'arrow') => void
    onExportReady?: (fns: { downloadViewport: () => void; downloadFullBoard: () => void }) => void
}

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(({ activeTool = 'select', onToolChange, onExportReady }, ref) => {
    const { items, setItems: setUploadedFiles, arrows, setArrows, addArrow, updateArrow, removeArrow } = useWhiteboardStore()
    const localRef = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef(new Map<string, HTMLElement>())
    const THROTTLE_MS = 8 // ~120fps

    const { zoom, panX, panY, isPanning, handleZoomWheel, handlePanMouseDown: handlePanMouseDown } = useViewport({ canvasRef: localRef })
    const { croppingItem, openCrop, applyCrop, closeCrop } = useCrop({ items, setItems: setUploadedFiles })
    const { downloadViewport, downloadFullBoard } = useCanvasExport({ viewportRef: localRef, canvasRef: innerRef, items, arrows })

    useEffect(() => {
        if (onExportReady) {
            onExportReady({ downloadViewport, downloadFullBoard })
        }
    }, [onExportReady, downloadViewport, downloadFullBoard])

    const { draggingId, handleItemMouseDown, handleDragMouseMove, handleDragMouseUp } = useItemDragging(
        items, setUploadedFiles, zoom, panX, panY, localRef, itemRefs, THROTTLE_MS
    )
    const { resizingId, setResizingId, handleResizeWheel, handleResizeStart } = useItemResizing(items, setUploadedFiles, itemRefs, zoom, panX)
    useItemKeyboardShortcuts(items, setUploadedFiles, itemRefs)

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

    useArrowKeyboardShortcuts({ arrows, removeArrow })

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
        const item = items.find(f => f.id === id)
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
            handleDragMouseMove(e)
        }
    }, [activeTool, isDrawing, handleArrowMouseMove, handleDragMouseMove])

    const handleMouseUp = useCallback(() => {
        if (activeTool === 'arrow' && isDrawing) {
            handleArrowMouseUp()
        } else {
            handleDragMouseUp()
        }
    }, [activeTool, isDrawing, handleArrowMouseUp, handleDragMouseUp])

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

    const handleDelete = (id: string) => {
        const isArrow = arrows.some(a => a.id === id)
        if (isArrow) {
            removeArrow(id)
        } else {
            setUploadedFiles(prev => prev.filter(img => img.id !== id))
        }
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
            onCrop={openCrop}
            isImageFn={(id) => !!items.find(f => f.id === id)?.src}
            isArrowFn={(id) => arrows.some(a => a.id === id)}
        >
            {(showMenu, closeMenu) => (
                <div
                    ref={(el) => { localRef.current = el; if (ref && typeof ref !== 'function') ref.current = el; }}
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
                        <ArrowLayer
                            arrows={arrows}
                            currentArrow={currentArrow}
                            zoom={zoom}
                            panX={panX}
                            panY={panY}
                            onSelect={handleArrowSelect}
                            onEndpointDrag={handleArrowEndpointDrag}
                            onDrag={handleArrowDrag}
                            onContextMenu={showMenu}
                            onSvgClick={handleCanvasClick}
                        />
                        {items.map((file: CanvasImage) => (
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
                    onCrop={applyCrop}
                    onClose={closeCrop}
                />
            </Suspense>
        )}
        </>
    )
})