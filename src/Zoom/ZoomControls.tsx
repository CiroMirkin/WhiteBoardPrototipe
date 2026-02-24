import React from 'react'
import { useZoom } from './useZoom'

export const ZoomControls: React.FC = () => {
  const { zoom, setZoom } = useZoom()

  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom * 1.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom / 1.2, 0.1))
  }

  const handleResetZoom = () => {
    setZoom(1)
  }

  const zoomPercent = Math.round(zoom * 100)

  return (
    <div className="zoom-controls ui-panel">
      <button 
        className="zoom-button" 
        onClick={handleZoomOut}
        aria-label="Zoom out"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>
      
      <span 
        className="zoom-level" 
        onClick={handleResetZoom}
        title="Ajustar a 100%"
      >
        {zoomPercent}%
      </span>
      
      <button 
        className="zoom-button" 
        onClick={handleZoomIn}
        aria-label="Zoom in"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>
    </div>
  )
}
