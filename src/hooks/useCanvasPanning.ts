import { useState, useCallback } from 'react'

export const useCanvasPanning = (
  zoom: number,
  panX: number,
  panY: number,
  setPan: (x: number, y: number) => void
) => {
  const [isPanning, setIsPanning] = useState(false)
  const [lastMouseX, setLastMouseX] = useState(0)
  const [lastMouseY, setLastMouseY] = useState(0)

  const handlePanMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) { // Middle mouse button
      setIsPanning(true)
      setLastMouseX(e.clientX)
      setLastMouseY(e.clientY)
      e.preventDefault()
    }
  }, [])

  const handlePanMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return
    const deltaX = (e.clientX - lastMouseX) / zoom
    const deltaY = (e.clientY - lastMouseY) / zoom
    setPan(panX + deltaX, panY + deltaY)
    setLastMouseX(e.clientX)
    setLastMouseY(e.clientY)
  }, [isPanning, lastMouseX, lastMouseY, zoom, panX, panY, setPan])

  const handlePanMouseUp = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) {
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