import { useState } from 'react'
import { ContextMenu } from './ContextMenu'

interface CanvasContextMenuProps {
  onDelete: (id: string) => void
  onResize: (id: string) => void
  onDownload?: (id: string) => void
  isImageFn?: (id: string) => boolean
  onClose?: (e?: React.MouseEvent) => void
  children: (showMenu: (id: string, x: number, y: number) => void, closeMenu: (e?: React.MouseEvent) => void) => React.ReactNode
}

export const CanvasContextMenu = ({ onDelete, onResize, onDownload, isImageFn, onClose, children }: CanvasContextMenuProps) => {
  const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, itemId: string }>({ visible: false, x: 0, y: 0, itemId: '' })

  const showMenu = (id: string, x: number, y: number) => {
    setContextMenu({ visible: true, x, y, itemId: id })
  }

  const handleDelete = () => {
    onDelete(contextMenu.itemId)
    setContextMenu({ ...contextMenu, visible: false })
  }

  const handleResize = () => {
    onResize(contextMenu.itemId)
    setContextMenu({ ...contextMenu, visible: false })
  }

  const handleDownload = () => {
    if (onDownload) onDownload(contextMenu.itemId)
    setContextMenu({ ...contextMenu, visible: false })
  }

  const closeMenu = (e?: React.MouseEvent) => {
    if (onClose) onClose(e)
    setContextMenu({ ...contextMenu, visible: false })
  }

  return (
    <>
      {children(showMenu, closeMenu)}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDelete={handleDelete}
          onResize={handleResize}
          onClose={closeMenu}
          onDownload={onDownload ? handleDownload : undefined}
          isImage={isImageFn ? isImageFn(contextMenu.itemId) : false}
        />
      )}
    </>
  )
}