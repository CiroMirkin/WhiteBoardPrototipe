import { useState, useCallback, useRef, useEffect } from 'react'
import { toCanvasCoords } from '../utils/coordinates'

interface UseViewportOptions {
  canvasRef: React.RefObject<HTMLDivElement | null>
}

export const useViewport = ({ canvasRef }: UseViewportOptions) => {
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isPanning, setIsPanning] = useState(false)

  const lastMouseX = useRef(0)
  const lastMouseY = useRef(0)

  const stateRef = useRef({ zoom, panX, panY })
  stateRef.current = { zoom, panX, panY }

  const setPan = useCallback((x: number, y: number) => {
    setPanX(x)
    setPanY(y)
  }, [])

  const handleZoomWheel = useCallback((e: Event) => {
    const wheelEvent = e as WheelEvent
    wheelEvent.preventDefault()
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = wheelEvent.clientX - rect.left
    const mouseY = wheelEvent.clientY - rect.top

    const { zoom: currentZoom, panX: currentPanX, panY: currentPanY } = stateRef.current

    const canvasMouseX = (mouseX - currentPanX) / currentZoom
    const canvasMouseY = (mouseY - currentPanY) / currentZoom

    const zoomFactor = wheelEvent.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.1, Math.min(5, currentZoom * zoomFactor))

    const newPanX = mouseX - canvasMouseX * newZoom
    const newPanY = mouseY - canvasMouseY * newZoom

    setZoom(newZoom)
    setPanX(newPanX)
    setPanY(newPanY)
  }, [canvasRef])

  const handlePanMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
      setIsPanning(true)
      lastMouseX.current = e.clientX
      lastMouseY.current = e.clientY
      e.preventDefault()
    }
  }, [])

  useEffect(() => {
    const handlePanMouseMove = (e: MouseEvent) => {
      if (!isPanning) return

      const currentZoom = stateRef.current.zoom
      const deltaX = (e.clientX - lastMouseX.current) * 1.5 / Math.sqrt(currentZoom)
      const deltaY = (e.clientY - lastMouseY.current) * 1.5 / Math.sqrt(currentZoom)

      setPanX(prev => prev + deltaX)
      setPanY(prev => prev + deltaY)

      lastMouseX.current = e.clientX
      lastMouseY.current = e.clientY
    }

    const handlePanMouseUp = () => {
      if (isPanning) {
        setIsPanning(false)
      }
    }

    if (isPanning) {
      window.addEventListener('mousemove', handlePanMouseMove)
      window.addEventListener('mouseup', handlePanMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handlePanMouseMove)
      window.removeEventListener('mouseup', handlePanMouseUp)
    }
  }, [isPanning])

  const toCanvas = useCallback((clientX: number, clientY: number) => {
    return toCanvasCoords(clientX, clientY, panX, panY, zoom)
  }, [panX, panY, zoom])

  return {
    zoom,
    panX,
    panY,
    setZoom,
    setPan,
    isPanning,
    toCanvas,
    handleZoomWheel,
    handlePanMouseDown,
  }
}
