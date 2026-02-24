import { useState, useCallback, useRef, useEffect } from 'react'

export const useCanvasPanning = (
  zoom: number,
  panX: number,
  panY: number,
  setPan: (x: number, y: number) => void
) => {
  const [isPanning, setIsPanning] = useState(false)
  const lastMouseX = useRef(0)
  const lastMouseY = useRef(0)
  const setPanRef = useRef(setPan)
  const zoomRef = useRef(zoom)

  setPanRef.current = setPan
  zoomRef.current = zoom

  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  const handlePanMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
      setIsPanning(true)
      lastMouseX.current = e.clientX
      lastMouseY.current = e.clientY
      e.preventDefault()
    }
  }, [])

  const handlePanMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return

    const currentZoom = zoomRef.current
    const deltaX = (e.clientX - lastMouseX.current) * 1.5 / Math.sqrt(currentZoom)
    const deltaY = (e.clientY - lastMouseY.current) * 1.5 / Math.sqrt(currentZoom)
    setPanRef.current(panX + deltaX, panY + deltaY)
    lastMouseX.current = e.clientX
    lastMouseY.current = e.clientY
  }, [isPanning, panX, panY])

  const handlePanMouseUp = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
      setIsPanning(false)
    }
  }, [])

  return {
    isPanning,
    handlePanMouseDown,
    handlePanMouseMove,
    handlePanMouseUp
  }
}
