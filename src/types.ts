export interface CanvasImage {
    id: string
    src: string
    x: number
    y: number
    zIndex: number
}

export interface FilesContextType {
    uploadedFiles: CanvasImage[]
    setUploadedFiles: React.Dispatch<React.SetStateAction<CanvasImage[]>>
}