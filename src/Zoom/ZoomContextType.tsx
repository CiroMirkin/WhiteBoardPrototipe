
export interface ZoomContextType {
    zoom: number
    setZoom: React.Dispatch<React.SetStateAction<number>>
    panX: number
    panY: number
    setPan: (x: number, y: number) => void
}
