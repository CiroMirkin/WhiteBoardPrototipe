import { useContext, createContext } from 'react'
import type { ZoomContextType } from './ZoomContextType'

export const ZoomContext = createContext<ZoomContextType | undefined>(undefined)

export const useZoom = () => {
  const context = useContext(ZoomContext)
  if (!context) {
    throw new Error('useZoom must be used within a ZoomProvider')
  }
  return context
}
