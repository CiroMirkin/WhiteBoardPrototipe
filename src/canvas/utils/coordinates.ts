export const toCanvasCoords = (
  clientX: number,
  clientY: number,
  panX: number,
  panY: number,
  zoom: number
) => ({
  x: (clientX - panX) / zoom,
  y: (clientY - panY) / zoom,
})

export const toScreenCoords = (
  canvasX: number,
  canvasY: number,
  panX: number,
  panY: number,
  zoom: number
) => ({
  x: canvasX * zoom + panX,
  y: canvasY * zoom + panY,
})
