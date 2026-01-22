import { useEffect } from 'react'
import type { CanvasImage } from '../types'

export const useItemKeyboardShortcuts = (
  uploadedFiles: CanvasImage[],
  setUploadedFiles: React.Dispatch<React.SetStateAction<CanvasImage[]>>,
  itemRefs: React.RefObject<Map<string, HTMLElement>>
) => {
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
            setUploadedFiles(prev =>
              prev.map(img => img.id === selected.id ? { ...img, width: newWidth, height: newHeight } : img)
            )
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [uploadedFiles, setUploadedFiles, itemRefs])
}