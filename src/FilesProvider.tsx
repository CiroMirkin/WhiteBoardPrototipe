import { type ReactNode } from 'react'
import { FilesContext } from './FilesContext'
import { useLocalStorage } from '@uidotdev/usehooks'
import type { CanvasImage } from './types'

export const FilesProvider = ({ children }: { children: ReactNode }) => {
    const [uploadedFiles, setUploadedFiles] = useLocalStorage<CanvasImage[]>('files', [])

    const removeFile = (id: string) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== id))
    }
    
    return (
        <FilesContext.Provider value={{ uploadedFiles, setUploadedFiles, removeFile }}>
            {children}
        </FilesContext.Provider>
    )
}
