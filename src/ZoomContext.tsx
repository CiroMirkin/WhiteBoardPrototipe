import React, { useState } from 'react'
import { ZoomContext } from './useZoom'

export const ZoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [zoom, setZoom] = useState(1)

  return (
    <ZoomContext.Provider value={{ zoom, setZoom }}>
      {children}
    </ZoomContext.Provider>
  )
}
