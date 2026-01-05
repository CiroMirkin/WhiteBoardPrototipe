import { type ReactNode } from 'react'
import { FilesContext } from './FilesContext.1'
import { useLocalStorage } from '@uidotdev/usehooks'

interface CanvasImage {
    id: string
    src: string
    x: number
    y: number
}

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

