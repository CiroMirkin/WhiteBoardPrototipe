import { useContext } from 'react'
import { AdvancedCoordinateContext } from './AdvancedCoordinateState'


export const useAdvancedCoordinate = () => {
  const context = useContext(AdvancedCoordinateContext)
  if (!context) {
    throw new Error('useAdvancedCoordinate must be used within AdvancedCoordinateProvider')
  }
  return context
}
