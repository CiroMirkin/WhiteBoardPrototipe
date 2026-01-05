import { useContext } from 'react'
import { FilesContext } from './FilesContext.1'

export const useFiles = () => {
    const context = useContext(FilesContext)
    if (!context) throw new Error('useFiles debe usarse dentro de FilesProvider')
    return context
}
