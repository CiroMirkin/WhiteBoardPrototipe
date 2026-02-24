import { useCallback, useRef } from 'react'

export const useCanvasZooming = (
  zoom: number,
  panX: number,
  panY: number,
  setZoom: (z: number) => void,
  setPan: (x: number, y: number) => void,
  canvasRef: React.RefObject<HTMLDivElement | null>
) => {
  const stateRef = useRef({ zoom, panX, panY, setZoom, setPan })

  stateRef.current = { zoom, panX, panY, setZoom, setPan }

  const handleZoomWheel = useCallback((e: Event) => {
    const wheelEvent = e as WheelEvent
    wheelEvent.preventDefault()
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = wheelEvent.clientX - rect.left
    const mouseY = wheelEvent.clientY - rect.top

    const { zoom: currentZoom, panX: currentPanX, panY: currentPanY, setZoom: currentSetZoom, setPan: currentSetPan } = stateRef.current

    const canvasMouseX = (mouseX - currentPanX) / currentZoom
    const canvasMouseY = (mouseY - currentPanY) / currentZoom

    const zoomFactor = wheelEvent.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.1, Math.min(5, currentZoom * zoomFactor))

    const newPanX = mouseX - canvasMouseX * newZoom
    const newPanY = mouseY - canvasMouseY * newZoom

    currentSetZoom(newZoom)
    currentSetPan(newPanX, newPanY)
  }, [canvasRef])

  return {
    handleZoomWheel
  }
}
