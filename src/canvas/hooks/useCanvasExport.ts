import { useCallback } from 'react'
import type { CanvasImage, Arrow } from '../../types'

interface UseCanvasExportOptions {
    viewportRef: React.RefObject<HTMLDivElement | null>
    canvasRef: React.RefObject<HTMLDivElement | null>
    items: CanvasImage[]
    arrows: Arrow[]
}

const getContentBounds = (
    items: CanvasImage[],
    arrows: Arrow[]
): { minX: number; minY: number; maxX: number; maxY: number } => {
    let minX = 0, minY = 0, maxX = 0, maxY = 0

    items.forEach(file => {
        const right = file.x + (file.width || 200)
        const bottom = file.y + (file.height || 200)
        minX = Math.min(minX, file.x)
        minY = Math.min(minY, file.y)
        maxX = Math.max(maxX, right)
        maxY = Math.max(maxY, bottom)
    })

    arrows.forEach(arrow => {
        minX = Math.min(minX, arrow.x1, arrow.x2)
        minY = Math.min(minY, arrow.y1, arrow.y2)
        maxX = Math.max(maxX, arrow.x1, arrow.x2)
        maxY = Math.max(maxY, arrow.y1, arrow.y2)
    })

    return { minX, minY, maxX, maxY }
}

export const useCanvasExport = ({ viewportRef, canvasRef, items, arrows }: UseCanvasExportOptions) => {
    const downloadViewport = useCallback(async () => {
        if (!viewportRef.current) return
        const { toPng } = await import('html-to-image')
        const dataUrl = await toPng(viewportRef.current, {
            pixelRatio: 3,
            backgroundColor: '#ffffff',
        })
        const link = document.createElement('a')
        link.download = 'whiteboard.png'
        link.href = dataUrl
        link.click()
    }, [viewportRef])

    const downloadFullBoard = useCallback(async () => {
        if (!canvasRef.current) return
        const { toPng } = await import('html-to-image')
        const padding = 100
        const { minX, minY, maxX, maxY } = getContentBounds(items, arrows)
        const dataUrl = await toPng(canvasRef.current, {
            pixelRatio: 3,
            backgroundColor: '#ffffff',
            style: {
                transform: 'none',
                position: 'absolute',
                left: `${-minX + padding / 2}px`,
                top: `${-minY + padding / 2}px`,
            },
            width: maxX - minX + padding,
            height: maxY - minY + padding,
        })
        const link = document.createElement('a')
        link.download = 'whiteboard-full.png'
        link.href = dataUrl
        link.click()
    }, [canvasRef, items, arrows])

    return { downloadViewport, downloadFullBoard }
}