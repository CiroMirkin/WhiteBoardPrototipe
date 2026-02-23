import { useState, useCallback } from 'react'
import { CoordinateUtils, type CoordinateTransform } from '../math/CoordinateUtils'
import { Point } from '../math/Point'
import { AdvancedCoordinateContext, type AdvancedCoordinateState } from './AdvancedCoordinateState'

interface AdvancedCoordinateProviderProps {
  children: React.ReactNode
  initialZoom?: number
  minZoom?: number
  maxZoom?: number
}

export const AdvancedCoordinateProvider: React.FC<AdvancedCoordinateProviderProps> = ({
  children,
  initialZoom = 1,
  minZoom = 0.001,
  maxZoom = 1000
}) => {
  const [zoom, setZoomState] = useState(initialZoom)
  const [panX, setPanXState] = useState(0)
  const [panY, setPanYState] = useState(0)

  const setZoom = useCallback((newZoom: number) => {
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom))
    setZoomState(clampedZoom)
  }, [minZoom, maxZoom])

  const setPan = useCallback((x: number, y: number) => {
    setPanXState(x)
    setPanYState(y)
  }, [])

  const setTransform = useCallback((transform: Partial<CoordinateTransform>) => {
    if (transform.zoom !== undefined) setZoom(transform.zoom)
    if (transform.panX !== undefined) setPanXState(transform.panX)
    if (transform.panY !== undefined) setPanYState(transform.panY)
  }, [setZoom])

  const screenToCanvas = useCallback((screenPoint: Point): Point => {
    return CoordinateUtils.screenToCanvas(screenPoint, { zoom, panX, panY })
  }, [zoom, panX, panY])

  const canvasToScreen = useCallback((canvasPoint: Point): Point => {
    return CoordinateUtils.canvasToScreen(canvasPoint, { zoom, panX, panY })
  }, [zoom, panX, panY])

  const zoomToPoint = useCallback((screenPoint: Point, newZoom: number): void => {
    const currentTransform = { zoom, panX, panY }
    const newTransform = CoordinateUtils.centerZoomOnPoint(currentTransform, screenPoint, newZoom)
    setZoomState(newTransform.zoom)
    setPanXState(newTransform.panX)
    setPanYState(newTransform.panY)
  }, [zoom, panX, panY])

  const value: AdvancedCoordinateState = {
    zoom,
    panX,
    panY,
    setZoom,
    setPan,
    setTransform,
    screenToCanvas,
    canvasToScreen,
    zoomToPoint
  }

  return (
    <AdvancedCoordinateContext.Provider value={value}>
      {children}
    </AdvancedCoordinateContext.Provider>
  )
}