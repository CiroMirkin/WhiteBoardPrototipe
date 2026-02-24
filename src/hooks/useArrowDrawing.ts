import { useState, useCallback } from 'react'
import type { Arrow } from '../types'

interface UseArrowDrawingProps {
    zoom: number
    panX: number
    panY: number
    addArrow: (arrow: Arrow) => void
    isArrowMode: boolean
}

export const useArrowDrawing = ({ zoom, panX, panY, addArrow, isArrowMode }: UseArrowDrawingProps) => {
    const [isDrawing, setIsDrawing] = useState(false)
    const [currentArrow, setCurrentArrow] = useState<Arrow | null>(null)

    const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
        return {
            x: (clientX - panX) / zoom,
            y: (clientY - panY) / zoom
        }
    }, [zoom, panX, panY])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!isArrowMode) return
        
        const coords = getCanvasCoords(e.clientX, e.clientY)
        const newArrow: Arrow = {
            id: `arrow-${Date.now()}`,
            x1: coords.x,
            y1: coords.y,
            x2: coords.x,
            y2: coords.y,
            selected: false
        }
        setCurrentArrow(newArrow)
        setIsDrawing(true)
    }, [isArrowMode, getCanvasCoords])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDrawing || !currentArrow) return
        
        const coords = getCanvasCoords(e.clientX, e.clientY)
        setCurrentArrow(prev => prev ? {
            ...prev,
            x2: coords.x,
            y2: coords.y
        } : null)
    }, [isDrawing, currentArrow, getCanvasCoords])

    const handleMouseUp = useCallback(() => {
        if (!isDrawing || !currentArrow) return
        
        const dist = Math.hypot(currentArrow.x2 - currentArrow.x1, currentArrow.y2 - currentArrow.y1)
        
        if (dist > 15) {
            addArrow(currentArrow)
        }
        
        setCurrentArrow(null)
        setIsDrawing(false)
    }, [isDrawing, currentArrow, addArrow])

    return {
        isDrawing,
        currentArrow,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp
    }
}
