import type { Arrow } from '../types'
import { ArrowItem } from '../components/ArrowItem'

interface ArrowLayerProps {
  arrows: Arrow[]
  currentArrow: Arrow | null
  zoom: number
  panX: number
  panY: number
  onSelect: (id: string) => void
  onEndpointDrag: (id: string, endpoint: 'start' | 'end', x: number, y: number) => void
  onDrag: (id: string, dx: number, dy: number) => void
  onContextMenu: (id: string, x: number, y: number) => void
  onSvgClick: () => void
}

export const ArrowLayer: React.FC<ArrowLayerProps> = ({
  arrows,
  currentArrow,
  zoom,
  panX,
  panY,
  onSelect,
  onEndpointDrag,
  onDrag,
  onContextMenu,
  onSvgClick,
}) => {
  return (
    <svg 
      className="arrows-layer"
      width="100%"
      height="100%"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onSvgClick()
        }
      }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
        </marker>
        <marker id="arrowhead-selected" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
        </marker>
      </defs>
      {arrows.map(arrow => (
        <ArrowItem
          key={arrow.id}
          arrow={arrow}
          onSelect={onSelect}
          onEndpointDrag={onEndpointDrag}
          onArrowDrag={onDrag}
          onContextMenu={(e) => onContextMenu(arrow.id, e.clientX, e.clientY)}
          zoom={zoom}
          panX={panX}
          panY={panY}
        />
      ))}
      {currentArrow && (
        <line
          x1={currentArrow.x1}
          y1={currentArrow.y1}
          x2={currentArrow.x2}
          y2={currentArrow.y2}
          stroke="#ef4444"
          strokeWidth={2}
          markerEnd="url(#arrowhead)"
        />
      )}
    </svg>
  )
}
