import React, { useState } from 'react'
import { ZoomContext } from './useZoom'

export const ZoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)

  const setPan = (x: number, y: number) => {
    setPanX(x)
    setPanY(y)
  }

  return (
    <ZoomContext.Provider value={{ zoom, setZoom, panX, panY, setPan }}>
      {children}
    </ZoomContext.Provider>
  )
}
