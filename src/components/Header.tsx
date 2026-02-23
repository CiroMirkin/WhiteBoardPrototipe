import React from 'react'
import { FileUploader } from '../FileUploader'
import AddText from '../AddText'
import CleanBoardBtn from '../CleanBoardBtn'
import './header.css'

interface HeaderProps {
  onDownload: () => void
  onFullDownload: () => void
}

export const Header: React.FC<HeaderProps> = ({ onDownload, onFullDownload }) => {
  return (
    <div className="header-container">
  <div className="header-overlay">
    <header className="header">
      <AddText />
      <FileUploader />
      <button onClick={onDownload}>Instantánea</button>
      <button onClick={onFullDownload}>Captura Completa</button>
      <CleanBoardBtn />
      <a className="header__github-link" href="https://github.com/CiroMirkin/WhiteBoardPrototipe" target="_blank" rel="noopener noreferrer">GitHub</a>
    </header>
  </div>
</div>
  )
}