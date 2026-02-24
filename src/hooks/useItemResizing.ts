import { useState, useCallback, useRef, useEffect } from 'react'
import type { CanvasImage } from '../types'
import { updateItemPositionAndSize } from '../utils/canvasUtils'
import type { HandlePosition } from '../components/ResizeHandles'

interface ResizeDragState {
  position: HandlePosition
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  startItemX: number
  startItemY: number
  startFontSize?: number
}

export const useItemResizing = (
  uploadedFiles: CanvasImage[],
  setUploadedFiles: React.Dispatch<React.SetStateAction<CanvasImage[]>>,
  itemRefs: React.RefObject<Map<string, HTMLElement>>,
  zoom: number,
  panX: number
) => {
  const [resizingId, setResizingId] = useState<string | null>(null)
  const resizeDragRef = useRef<ResizeDragState | null>(null)

  const handleResizeWheel = useCallback((wheelEvent: WheelEvent) => {
    if (!resizingId) return
    const item = uploadedFiles.find(f => f.id === resizingId)
    if (!item) return

    const scale = wheelEvent.deltaY > 0 ? 0.9 : 1.1
    const element = itemRefs.current.get(resizingId)
    if (element) {
      const currentWidth = element.offsetWidth
      const currentHeight = element.offsetHeight
      const newWidth = Math.max(20, currentWidth * scale)
      const newHeight = Math.max(20, currentHeight * scale)
      updateItemPositionAndSize(setUploadedFiles, resizingId, item.x, item.y, newWidth, newHeight)
    }
  }, [resizingId, uploadedFiles, setUploadedFiles, itemRefs])

  const handleResizeStart = useCallback((id: string, position: HandlePosition, clientX: number, clientY: number) => {
    const item = uploadedFiles.find(f => f.id === id)
    if (!item) return

    const element = itemRefs.current.get(id)
    let startWidth = item.width || 200
    let startHeight = item.height || 100

    if (element) {
      startWidth = element.offsetWidth || startWidth
      startHeight = element.offsetHeight || startHeight
    }

    setResizingId(id)
    resizeDragRef.current = {
      position,
      startX: clientX,
      startY: clientY,
      startWidth,
      startHeight,
      startItemX: item.x,
      startItemY: item.y,
      startFontSize: item.type === 'text' ? (item.fontSize || 20) : undefined,
    }
  }, [uploadedFiles, itemRefs])

  const handleResizeMouseMove = useCallback((clientX: number) => {
    if (!resizingId || !resizeDragRef.current) return
    
    const item = uploadedFiles.find(f => f.id === resizingId)
    if (!item) return

    const { position, startX, startWidth, startHeight, startItemX, startItemY, startFontSize } = resizeDragRef.current
    
    const canvasStartX = startX / zoom - panX
    const canvasClientX = clientX / zoom - panX
    const deltaX = canvasClientX - canvasStartX
    
    let newWidth = startWidth
    let newHeight = startHeight
    let newX = startItemX
    let newY = startItemY

    const aspectRatio = startWidth / startHeight
    
    switch (position) {
      case 'se':
        newWidth = Math.max(20, startWidth + deltaX)
        newHeight = newWidth / aspectRatio
        break
      case 'sw':
        newWidth = Math.max(20, startWidth - deltaX)
        newHeight = newWidth / aspectRatio
        newX = startItemX + (startWidth - newWidth)
        break
      case 'ne':
        newWidth = Math.max(20, startWidth + deltaX)
        newHeight = newWidth / aspectRatio
        newY = startItemY + (startHeight - newHeight)
        break
      case 'nw':
        newWidth = Math.max(20, startWidth - deltaX)
        newHeight = newWidth / aspectRatio
        newX = startItemX + (startWidth - newWidth)
        newY = startItemY + (startHeight - newHeight)
        break
    }

    let newFontSize: number | undefined
    if (item.type === 'text' && startFontSize) {
      const widthScale = newWidth / startWidth
      newFontSize = Math.max(10, startFontSize * widthScale)
    }

    updateItemPositionAndSize(setUploadedFiles, resizingId, newX, newY, newWidth, newHeight, newFontSize)
  }, [resizingId, uploadedFiles, setUploadedFiles, zoom, panX])

  const handleResizeMouseUp = useCallback(() => {
    setResizingId(null)
    resizeDragRef.current = null
  }, [])

  useEffect(() => {
    if (resizingId) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleResizeMouseMove(e.clientX)
      }
      const handleGlobalMouseUp = () => {
        handleResizeMouseUp()
      }

      window.addEventListener('mousemove', handleGlobalMouseMove)
      window.addEventListener('mouseup', handleGlobalMouseUp)

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove)
        window.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [resizingId, handleResizeMouseMove, handleResizeMouseUp])

  return {
    resizingId,
    setResizingId,
    handleResizeWheel,
    handleResizeStart
  }
}
