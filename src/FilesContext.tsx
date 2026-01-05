import { type ReactNode } from 'react'
import { FilesContext } from './FilesContext.1'
import { useLocalStorage } from '@uidotdev/usehooks'
import type { CanvasImage } from './types'

export interface FilesContextType {
    uploadedFiles: CanvasImage[]
    setUploadedFiles: React.Dispatch<React.SetStateAction<CanvasImage[]>>
}

export const FilesProvider = ({ children }: { children: ReactNode }) => {
    const [uploadedFiles, setUploadedFiles] = useLocalStorage<CanvasImage[]>('files', [])
    return (
        <FilesContext.Provider value={{ uploadedFiles, setUploadedFiles }}>
            {children}
        </FilesContext.Provider>
    )
}

