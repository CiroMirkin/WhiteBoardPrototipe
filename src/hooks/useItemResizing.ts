import { useState, useCallback, useRef, useEffect } from 'react'
import type { CanvasImage } from '../types'
import { updateItemSize, updateItemPositionAndSize } from '../utils/canvasUtils'
import type { HandlePosition } from '../components/ResizeHandles'

interface ResizeDragState {
  position: HandlePosition
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  startItemX: number
  startItemY: number
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
    if (item.type === 'text') {
      const currentFontSize = item.fontSize || 20
      const newFontSize = Math.max(10, currentFontSize * scale)
      const newWidth = item.width ? Math.max(20, item.width * scale) : 0
      const newHeight = item.height ? Math.max(20, item.height * scale) : 0
      updateItemSize(setUploadedFiles, resizingId, newWidth, newHeight, newFontSize)
    } else {
      const element = itemRefs.current.get(resizingId)
      if (element) {
        const currentWidth = element.offsetWidth
        const currentHeight = element.offsetHeight
        const newWidth = Math.max(20, currentWidth * scale)
        const newHeight = Math.max(20, currentHeight * scale)
        updateItemSize(setUploadedFiles, resizingId, newWidth, newHeight)
      }
    }
  }, [resizingId, uploadedFiles, setUploadedFiles, itemRefs])

  const handleResizeStart = useCallback((id: string, position: HandlePosition, clientX: number, clientY: number) => {
    const item = uploadedFiles.find(f => f.id === id)
    if (!item) return

    setResizingId(id)
    resizeDragRef.current = {
      position,
      startX: clientX,
      startY: clientY,
      startWidth: item.width || 200,
      startHeight: item.height || 100,
      startItemX: item.x,
      startItemY: item.y,
    }
  }, [uploadedFiles])

  const handleResizeMouseMove = useCallback((clientX: number) => {
    if (!resizingId || !resizeDragRef.current) return
    
    const item = uploadedFiles.find(f => f.id === resizingId)
    if (!item) return

    const { position, startX, startWidth, startHeight, startItemX, startItemY } = resizeDragRef.current
    
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

    updateItemPositionAndSize(setUploadedFiles, resizingId, newX, newY, newWidth, newHeight)
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
