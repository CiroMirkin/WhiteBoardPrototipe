import { useMemo } from 'react'
import { CoordinateUtils } from '../math/CoordinateUtils'
import { Rectangle } from '../math/Rectangle'
import { useAdvancedCoordinate } from './useAdvancedCoordinate'
import type { CanvasImage } from '../types'

export const useViewportCulling = (items: CanvasImage[], canvasSize: { width: number; height: number }) => {
  const { zoom, panX, panY } = useAdvancedCoordinate()

  return useMemo(() => {
    if (!items.length) return { visibleItems: [], viewportBounds: Rectangle.empty() }

    const viewportBounds = CoordinateUtils.getViewportBounds(
      { x: canvasSize.width, y: canvasSize.height },
      { zoom, panX, panY }
    )

    const expandedViewport = Rectangle.expand(viewportBounds, 100)

    const visibleItems = items.filter(item => {
      const itemRect = Rectangle.fromPoint(
        { x: item.x, y: item.y },
        item.width || 100,
        item.height || 100
      )
      return Rectangle.intersects(itemRect, expandedViewport)
    })

    return { visibleItems, viewportBounds }
  }, [items, canvasSize.width, canvasSize.height, zoom, panX, panY])
}