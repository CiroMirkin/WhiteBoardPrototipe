import { useState, useRef, useCallback } from 'react'
import type { CanvasImage } from '../types'
import { updateItemPosition } from '../utils/canvasUtils'

export const useItemDragging = (
  uploadedFiles: CanvasImage[],
  setUploadedFiles: React.Dispatch<React.SetStateAction<CanvasImage[]>>,
  zoom: number,
  panX: number,
  panY: number,
  canvasRef: React.RefObject<HTMLDivElement>,
  itemRefs: React.MutableRefObject<Map<string, HTMLElement>>,
  THROTTLE_MS: number
) => {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const lastUpdateRef = useRef(0)
  const currentDragPosition = useRef({ x: 0, y: 0 })

  const handleItemMouseDown = useCallback((id: string, clientX: number, clientY: number) => {
    const item = uploadedFiles.find(img => img.id === id)
    if (!item || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
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
  }, [uploadedFiles, setUploadedFiles, zoom, panX, panY, canvasRef, itemRefs])

  const handleDragMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingId || !canvasRef.current) return
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
  }, [draggingId, canvasRef, zoom, panX, panY, itemRefs, THROTTLE_MS])

  const handleDragMouseUp = useCallback(() => {
    if (draggingId) {
      updateItemPosition(setUploadedFiles, draggingId, currentDragPosition.current.x, currentDragPosition.current.y)
      setDraggingId(null)
    }
  }, [draggingId, setUploadedFiles])

  return {
    draggingId,
    handleItemMouseDown,
    handleDragMouseMove,
    handleDragMouseUp
  }
}