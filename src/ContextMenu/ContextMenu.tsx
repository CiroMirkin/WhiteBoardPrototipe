import './contextMenu.css'

interface ContextMenuProps {
  x: number
  y: number
  onDelete: () => void
  onResize: () => void
  onDownload?: () => void
  isImage: boolean
  onClose: () => void
  showResize?: boolean
}

export const ContextMenu = ({ x, y, onDelete, onResize, onDownload, isImage, onClose, showResize = true }: ContextMenuProps) => {
  const handleDelete = () => {
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este elemento?')
    
    if (confirmDelete) {
      onDelete()
      return
    }
    onClose()
  }

  return (
    <div
      className="context-menu"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {showResize && (
        <button className="context-menu__button" onClick={onResize}>
          Redimensionar
        </button>
      )}
      {isImage && onDownload && (
        <button className="context-menu__button" onClick={onDownload}>
          Descargar
        </button>
      )}
      <button className="context-menu__button context-menu__button--danger" onClick={handleDelete}>
        Eliminar
      </button>
    </div>
  )
}