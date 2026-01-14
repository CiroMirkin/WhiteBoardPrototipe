import React from 'react'
import { useZoom } from './useZoom'

export const ZoomControls: React.FC = () => {
  const { setZoom } = useZoom()

  const handleZoomIn = () => {
    setZoom(prevZoom => prevZoom * 1.2)
  }

  const handleZoomOut = () => {
    setZoom(prevZoom => prevZoom / 1.2)
  }

  return (
    <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 100 }}>
      <button onClick={handleZoomIn} style={{ marginRight: '10px' }}> + </button>
      <button onClick={handleZoomOut}> - </button>
    </div>
  )
}
