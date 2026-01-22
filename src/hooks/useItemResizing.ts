import { useState, useCallback } from 'react'
import type { CanvasImage } from '../types'
import { updateItemSize } from '../utils/canvasUtils'

export const useItemResizing = (
  uploadedFiles: CanvasImage[],
  setUploadedFiles: React.Dispatch<React.SetStateAction<CanvasImage[]>>,
  itemRefs: React.MutableRefObject<Map<string, HTMLElement>>
) => {
  const [resizingId, setResizingId] = useState<string | null>(null)

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

  return {
    resizingId,
    setResizingId,
    handleResizeWheel
  }
}