import React from 'react'
import { FileUploader } from '../FileUploader'
import CleanBoardBtn from '../CleanBoardBtn'
import AddText from '../AddText'
import './header.css'

interface HeaderProps {
  onDownload: () => void
  onFullDownload: () => void
  activeTool: 'select' | 'text' | 'image' | 'arrow'
  onToolChange: (tool: 'select' | 'text' | 'image' | 'arrow') => void
}

export const Header: React.FC<HeaderProps> = ({ onDownload, onFullDownload, activeTool, onToolChange }) => {
  const handleToolClick = (tool: 'select' | 'text' | 'image' | 'arrow') => {
    onToolChange(tool === activeTool ? 'select' : tool)
  }

  return (
    <>
      <div className="logo">
        <h1>
          <span className="logo-icon"></span>
          VISU
        </h1>
      </div>

      <div className="toolbar ui-panel">
        <button 
          className={`toolbar-button ${activeTool === 'arrow' ? 'active' : ''}`}
          title="Dibujar Flecha (A)"
          onClick={() => handleToolClick('arrow')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="5" y1="19" x2="19" y2="5" />
            <polyline points="12 5 19 5 19 12" />
          </svg>
        </button>
        <button 
          className={`toolbar-button ${activeTool === 'text' ? 'active' : ''}`} 
          title="Añadir Texto (T)"
          onClick={() => handleToolClick('text')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="12" y2="17" />
          </svg>
        </button>
        
        {activeTool === 'text' && (
          <div className={`add-text-container ${activeTool === 'text' ? 'active' : ''}`}>
            <AddText isActive={activeTool === 'text'} />
          </div>
        )}
        
        <FileUploader />

        <div className="toolbar-divider" />

        <CleanBoardBtn />
        
        <div className="toolbar-divider" />
        
        <button onClick={onDownload} className="toolbar-button" title="Descargar instantánea">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
        <button onClick={onFullDownload} className="toolbar-button" title="Captura completa">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
      </div>
    </>
  )
}
