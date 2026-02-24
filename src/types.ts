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

export interface Arrow {
    id: string
    x1: number
    y1: number
    x2: number
    y2: number
    selected?: boolean
}

export interface FilesContextType {
    uploadedFiles: CanvasImage[]
    setUploadedFiles: React.Dispatch<React.SetStateAction<CanvasImage[]>>
    removeFile: (id: string) => void
    arrows: Arrow[]
    setArrows: React.Dispatch<React.SetStateAction<Arrow[]>>
    addArrow: (arrow: Arrow) => void
    updateArrow: (id: string, updates: Partial<Arrow>) => void
    removeArrow: (id: string) => void
    clearArrows: () => void
}

export interface FilesProviderProps {
    children: React.ReactNode
}
