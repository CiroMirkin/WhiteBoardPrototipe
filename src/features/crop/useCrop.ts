import { useState, useCallback } from 'react'
import type { CanvasImage } from '../../types'
import { updateItemCrop } from '../../utils/canvasUtils'

interface CropData {
  x: number
  y: number
  width: number
  height: number
  naturalWidth: number
  naturalHeight: number
}

interface UseCropOptions {
  items: CanvasImage[]
  setItems: React.Dispatch<React.SetStateAction<CanvasImage[]>>
}

export const useCrop = ({ items, setItems }: UseCropOptions) => {
  const [croppingItem, setCroppingItem] = useState<CanvasImage | null>(null)

  const openCrop = useCallback((id: string) => {
    const item = items.find(img => img.id === id)
    if (item) {
      setCroppingItem(item)
    }
  }, [items])

  const applyCrop = useCallback((crop: CropData) => {
    if (croppingItem) {
      updateItemCrop(setItems, croppingItem.id, crop)
      setCroppingItem(null)
    }
  }, [croppingItem, setItems])

  const closeCrop = useCallback(() => {
    setCroppingItem(null)
  }, [])

  return {
    croppingItem,
    openCrop,
    applyCrop,
    closeCrop,
  }
}
