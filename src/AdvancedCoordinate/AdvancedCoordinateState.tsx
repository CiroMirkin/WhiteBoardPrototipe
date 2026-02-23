import { createContext } from 'react'
import type { CoordinateTransform } from '../math/CoordinateUtils'
import type { Point } from '../math/Point'


export interface AdvancedCoordinateState extends CoordinateTransform {
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  setTransform: (transform: Partial<CoordinateTransform>) => void
  screenToCanvas: (screenPoint: Point) => Point
  canvasToScreen: (canvasPoint: Point) => Point
  zoomToPoint: (screenPoint: Point, newZoom: number) => void
}

export const AdvancedCoordinateContext = createContext<AdvancedCoordinateState | undefined>(undefined)
