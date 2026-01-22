import { useCallback } from 'react'

export const useCanvasZooming = (
  zoom: number,
  panX: number,
  panY: number,
  setZoom: (z: number) => void,
  setPan: (x: number, y: number) => void,
  canvasRef: React.RefObject<HTMLDivElement>
) => {
  const handleZoomWheel = useCallback((e: Event) => {
    const wheelEvent = e as WheelEvent
    wheelEvent.preventDefault()
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = wheelEvent.clientX - rect.left
    const mouseY = wheelEvent.clientY - rect.top

    const canvasMouseX = mouseX / zoom - panX
    const canvasMouseY = mouseY / zoom - panY

    const zoomFactor = wheelEvent.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor))

    const newPanX = mouseX / newZoom - canvasMouseX
    const newPanY = mouseY / newZoom - canvasMouseY

    setZoom(newZoom)
    setPan(newPanX, newPanY)
  }, [zoom, panX, panY, setZoom, setPan, canvasRef])

  return {
    handleZoomWheel
  }
}