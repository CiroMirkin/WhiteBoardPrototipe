import type { CanvasImage } from '../types'

export const calculateBounds = (items: CanvasImage[]) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  items.forEach(item => {
    minX = Math.min(minX, item.x)
    minY = Math.min(minY, item.y)
    maxX = Math.max(maxX, item.x + (item.width || 100))
    maxY = Math.max(maxY, item.y + (item.height || 100))
  })
  if (items.length === 0) {
    minX = 0; minY = 0; maxX = 100; maxY = 100
  }
  return { minX, minY, maxX, maxY }
}

export const updateItemPosition = (setUploadedFiles: React.Dispatch<React.SetStateAction<CanvasImage[]>>, id: string, x: number, y: number) => {
  setUploadedFiles(prev => prev.map(img => img.id === id ? { ...img, x, y } : img))
}

export const updateItemSize = (setUploadedFiles: React.Dispatch<React.SetStateAction<CanvasImage[]>>, id: string, width: number, height: number, fontSize?: number) => {
  setUploadedFiles(prev => prev.map(img => img.id === id ? { ...img, width, height, ...(fontSize !== undefined ? { fontSize } : {}) } : img))
}

export const updateItemPositionAndSize = (setUploadedFiles: React.Dispatch<React.SetStateAction<CanvasImage[]>>, id: string, x: number, y: number, width: number, height: number, fontSize?: number) => {
  setUploadedFiles(prev => prev.map(img => img.id === id ? { ...img, x, y, width, height, ...(fontSize !== undefined ? { fontSize } : {}) } : img))
}

export const updateItemCrop = (setUploadedFiles: React.Dispatch<React.SetStateAction<CanvasImage[]>>, id: string, crop: { x: number; y: number; width: number; height: number; naturalWidth: number; naturalHeight: number }) => {
  setUploadedFiles(prev => prev.map(img => img.id === id ? { ...img, crop } : img))
}