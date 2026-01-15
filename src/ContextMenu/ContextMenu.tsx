
interface ContextMenuProps {
  x: number
  y: number
  onDelete: () => void
  onResize: () => void
  onClose: () => void
}

export const ContextMenu = ({ x, y, onDelete, onResize, onClose }: ContextMenuProps) => {
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
      style={{
        position: 'absolute',
        left: x,
        top: y,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        padding: '4px 0',
        minWidth: '120px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onResize}
        style={{
          width: '100%',
          padding: '8px 16px',
          border: 'none',
          background: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          color: '#000',
        }}
      >
        Redimensionar
      </button>
      <button
        onClick={handleDelete}
        style={{
          width: '100%',
          padding: '8px 16px',
          border: 'none',
          background: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          color: '#ff0000',
        }}
      >
        Eliminar
      </button>
    </div>
  )
}