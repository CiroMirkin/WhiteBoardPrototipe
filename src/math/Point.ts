export interface Point {
  x: number
  y: number
}

export const Point = {
  zero: (): Point => ({ x: 0, y: 0 }),

  add: (a: Point, b: Point): Point => ({
    x: a.x + b.x,
    y: a.y + b.y
  }),

  subtract: (a: Point, b: Point): Point => ({
    x: a.x - b.x,
    y: a.y - b.y
  }),

  multiply: (p: Point, scalar: number): Point => ({
    x: p.x * scalar,
    y: p.y * scalar
  }),

  divide: (p: Point, scalar: number): Point => ({
    x: p.x / scalar,
    y: p.y / scalar
  }),

  equals: (a: Point, b: Point, tolerance = 0.001): boolean => {
    return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance
  },

  distance: (a: Point, b: Point): number => {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return Math.sqrt(dx * dx + dy * dy)
  }
}