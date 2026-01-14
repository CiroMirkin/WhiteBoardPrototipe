import React from 'react'
import { ZoomControls } from './ZoomControls'

interface ZoomContainerProps {
  children: React.ReactNode
}

export const ZoomContainer: React.FC<ZoomContainerProps> = ({ children }) => {
  return (
    <div style={{ overflow: 'hidden', width: '100vw', height: '100vh' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>
      <ZoomControls />
    </div>
  )
}
