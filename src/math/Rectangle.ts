import { Point } from './Point'

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

export const Rectangle = {
  fromPoint: (point: Point, width: number, height: number): Rectangle => ({
    x: point.x,
    y: point.y,
    width,
    height
  }),

  empty: (): Rectangle => ({ x: 0, y: 0, width: 0, height: 0 }),

  contains: (rect: Rectangle, point: Point): boolean => {
    return point.x >= rect.x && 
           point.x <= rect.x + rect.width &&
           point.y >= rect.y && 
           point.y <= rect.y + rect.height
  },

  intersects: (a: Rectangle, b: Rectangle): boolean => {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y
  },

  union: (a: Rectangle, b: Rectangle): Rectangle => {
    const minX = Math.min(a.x, b.x)
    const minY = Math.min(a.y, b.y)
    const maxX = Math.max(a.x + a.width, b.x + b.width)
    const maxY = Math.max(a.y + a.height, b.y + b.height)
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  },

  expand: (rect: Rectangle, padding: number): Rectangle => ({
    x: rect.x - padding,
    y: rect.y - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2
  }),

  center: (rect: Rectangle): Point => ({
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  }),

  vertices: (rect: Rectangle): Point[] => [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height }
  ]
}