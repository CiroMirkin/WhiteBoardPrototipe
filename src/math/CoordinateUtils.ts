import { Point } from './Point'
import { Rectangle } from './Rectangle'

export interface CoordinateTransform {
  zoom: number
  panX: number
  panY: number
}

export const CoordinateUtils = {
  screenToCanvas: (screenPoint: Point, transform: CoordinateTransform): Point => ({
    x: screenPoint.x / transform.zoom - transform.panX,
    y: screenPoint.y / transform.zoom - transform.panY
  }),

  canvasToScreen: (canvasPoint: Point, transform: CoordinateTransform): Point => ({
    x: canvasPoint.x * transform.zoom + transform.panX * transform.zoom,
    y: canvasPoint.y * transform.zoom + transform.panY * transform.zoom
  }),

  canvasToScreenRect: (canvasRect: Rectangle, transform: CoordinateTransform): Rectangle => {
    const topLeft = { x: canvasRect.x, y: canvasRect.y }
    const screenTopLeft = CoordinateUtils.canvasToScreen(topLeft, transform)
    
    return {
      x: screenTopLeft.x,
      y: screenTopLeft.y,
      width: canvasRect.width * transform.zoom,
      height: canvasRect.height * transform.zoom
    }
  },

  getViewportBounds: (screenSize: Point, transform: CoordinateTransform): Rectangle => {
    const topLeft = CoordinateUtils.screenToCanvas(Point.zero(), transform)
    const bottomRight = CoordinateUtils.screenToCanvas(screenSize, transform)
    
    return {
      x: Math.min(topLeft.x, bottomRight.x),
      y: Math.min(topLeft.y, bottomRight.y),
      width: Math.abs(bottomRight.x - topLeft.x),
      height: Math.abs(bottomRight.y - topLeft.y)
    }
  },

  clampTransform: (transform: CoordinateTransform, minZoom: number, maxZoom: number): CoordinateTransform => ({
    ...transform,
    zoom: Math.max(minZoom, Math.min(maxZoom, transform.zoom))
  }),

  centerZoomOnPoint: (
    transform: CoordinateTransform,
    targetPoint: Point,
    newZoom: number
  ): CoordinateTransform => {
    const clampedZoom = Math.max(0.001, Math.min(1000, newZoom))
    
    const currentCanvasPoint = CoordinateUtils.screenToCanvas(targetPoint, transform)
    const newPanX = (targetPoint.x / clampedZoom) - currentCanvasPoint.x
    const newPanY = (targetPoint.y / clampedZoom) - currentCanvasPoint.y
    
    return {
      zoom: clampedZoom,
      panX: newPanX,
      panY: newPanY
    }
  },

  fitRectToScreen: (
    rect: Rectangle,
    screenSize: Point,
    padding: number = 50
  ): CoordinateTransform => {
    const scaleX = (screenSize.x - padding * 2) / rect.width
    const scaleY = (screenSize.y - padding * 2) / rect.height
    const zoom = Math.min(scaleX, scaleY, 10)
    
    const rectCenter = Rectangle.center(rect)
    const panX = (screenSize.x / 2 - rectCenter.x * zoom) / zoom
    const panY = (screenSize.y / 2 - rectCenter.y * zoom) / zoom
    
    return { zoom: Math.max(0.1, zoom), panX, panY }
  }
}