import { type ReactNode } from 'react'
import { FilesContext } from './FilesContext'
import { useLocalStorage } from '@uidotdev/usehooks'
import type { CanvasImage, Arrow } from './types'

export const FilesProvider = ({ children }: { children: ReactNode }) => {
    const [uploadedFiles, setUploadedFiles] = useLocalStorage<CanvasImage[]>('files', [])
    const [arrows, setArrows] = useLocalStorage<Arrow[]>('arrows', [])

    const removeFile = (id: string) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== id))
    }

    const addArrow = (arrow: Arrow) => {
        setArrows(prev => [...prev, arrow])
    }

    const updateArrow = (id: string, updates: Partial<Arrow>) => {
        setArrows(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
    }

    const removeArrow = (id: string) => {
        setArrows(prev => prev.filter(a => a.id !== id))
    }

    const clearArrows = () => {
        setArrows([])
    }
    
    return (
        <FilesContext.Provider value={{ 
            uploadedFiles, 
            setUploadedFiles, 
            removeFile,
            arrows,
            setArrows,
            addArrow,
            updateArrow,
            removeArrow,
            clearArrows
        }}>
            {children}
        </FilesContext.Provider>
    )
}
