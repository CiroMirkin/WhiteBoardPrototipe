import { useState } from 'react'
import { ContextMenu } from './ContextMenu'

interface CanvasContextMenuProps {
  onDelete: (id: string) => void
  children: (showMenu: (id: string, x: number, y: number) => void, closeMenu: () => void) => React.ReactNode
}

export const CanvasContextMenu = ({ onDelete, children }: CanvasContextMenuProps) => {
  const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, itemId: string }>({ visible: false, x: 0, y: 0, itemId: '' })

  const showMenu = (id: string, x: number, y: number) => {
    setContextMenu({ visible: true, x, y, itemId: id })
  }

  const handleDelete = () => {
    onDelete(contextMenu.itemId)
    setContextMenu({ ...contextMenu, visible: false })
  }

  const closeMenu = () => {
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
          onClose={closeMenu}
        />
      )}
    </>
  )
}