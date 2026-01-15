export interface CanvasImage {
    id: string
    src?: string
    x: number
    y: number
    zIndex: number
    type?: 'text' | 'img'
    value?: string
    width?: number
    height?: number
    fontSize?: number
}

export interface FilesContextType {
    uploadedFiles: CanvasImage[]
    setUploadedFiles: React.Dispatch<React.SetStateAction<CanvasImage[]>>
    removeFile: (id: string) => void
}

export interface FilesProviderProps {
    children: React.ReactNode
}
