import { useRef, useState, useCallback, useEffect, forwardRef } from 'react'
import { useFiles } from './useFiles'
import type { CanvasImage } from './types'
import { useZoom } from './Zoom/useZoom'
import { CanvasItem } from './CanvasItem'
import { CanvasContextMenu } from './ContextMenu/CanvasContextMenu'

export const Canvas = forwardRef<HTMLDivElement>((_, ref) => {
    const { uploadedFiles, setUploadedFiles } = useFiles()
    const { zoom, setZoom, panX, panY, setPan } = useZoom()
    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [resizingId, setResizingId] = useState<string | null>(null)
    const [isPanning, setIsPanning] = useState(false)
    const [lastMouseX, setLastMouseX] = useState(0)
    const [lastMouseY, setLastMouseY] = useState(0)
    const localRef = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)
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

    const updateItemSize = useCallback((id: string, width: number, height: number, fontSize?: number) => {
        setUploadedFiles(prev =>
            prev.map(img => img.id === id ? { ...img, width, height, ...(fontSize !== undefined ? { fontSize } : {}) } : img)
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
        if (!item || !localRef.current) return

        const rect = localRef.current.getBoundingClientRect()
        const canvasX = (clientX - rect.left) / zoom - panX
        const canvasY = (clientY - rect.top) / zoom - panY

        dragOffsetRef.current = {
            x: canvasX - item.x,
            y: canvasY - item.y
        }

        currentDragPosition.current = { x: item.x, y: item.y }

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
        } else if (draggingId && localRef.current) {
            const now = Date.now()
            if (now - lastUpdateRef.current < THROTTLE_MS) return
            lastUpdateRef.current = now

            const rect = localRef.current.getBoundingClientRect()
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

    const handleWheel = useCallback((e: Event) => {
        const wheelEvent = e as WheelEvent
        wheelEvent.preventDefault()
        if (!localRef.current) return

        if (resizingId) {
            // Resize the element
            const item = uploadedFiles.find(f => f.id === resizingId)
            if (item) {
                const scale = wheelEvent.deltaY > 0 ? 0.9 : 1.1
                if (item.type === 'text') {
                    const currentFontSize = item.fontSize || 20
                    const newFontSize = Math.max(10, currentFontSize * scale)
                    const newWidth = item.width ? Math.max(20, item.width * scale) : 0
                    const newHeight = item.height ? Math.max(20, item.height * scale) : 0
                    updateItemSize(resizingId, newWidth, newHeight, newFontSize)
                } else {
                    const element = itemRefs.current.get(resizingId)
                    if (element) {
                        const currentWidth = element.offsetWidth
                        const currentHeight = element.offsetHeight
                        const newWidth = Math.max(20, currentWidth * scale)
                        const newHeight = Math.max(20, currentHeight * scale)
                        updateItemSize(resizingId, newWidth, newHeight)
                    }
                }
            }
            return
        }

        const rect = localRef.current.getBoundingClientRect()
        const mouseX = wheelEvent.clientX - rect.left
        const mouseY = wheelEvent.clientY - rect.top

        const canvasMouseX = mouseX / zoom - panX
        const canvasMouseY = mouseY / zoom - panY

        const zoomFactor = wheelEvent.deltaY > 0 ? 0.9 : 1.1
        const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor))

        const newPanX = mouseX / newZoom - canvasMouseX
        const newPanY = mouseY / newZoom - canvasMouseY

        setZoom(newZoom)
        setPan(newPanX, newPanY)
    }, [zoom, panX, panY, setZoom, setPan, resizingId, updateItemSize, uploadedFiles])

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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && (e.key === '+' || e.key === '=' || e.key === '-')) {
                e.preventDefault()
                const selected = uploadedFiles.find(f => f.zIndex === 1)
                if (selected) {
                    const element = itemRefs.current.get(selected.id)
                    if (element) {
                        const currentWidth = element.offsetWidth
                        const currentHeight = element.offsetHeight
                        const scale = (e.key === '+' || e.key === '=') ? 1.1 : 0.9
                        const newWidth = Math.max(20, currentWidth * scale)
                        const newHeight = Math.max(20, currentHeight * scale)
                        updateItemSize(selected.id, newWidth, newHeight)
                    }
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [uploadedFiles, updateItemSize])

    const downloadBoard = async () => {
        if (!innerRef.current) return
        const originalTransform = innerRef.current.style.transform
        innerRef.current.style.transform = 'none'
        const html2canvas = await import('html2canvas')
        const canvas = await html2canvas.default(innerRef.current, { useCORS: true })
        innerRef.current.style.transform = originalTransform
        const link = document.createElement('a')
        link.download = 'whiteboard-full.jpg'
        link.href = canvas.toDataURL('image/jpeg')
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
