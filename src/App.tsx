import { useRef } from 'react'
import { registerPlugin } from 'react-filepond'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'

import { FilesProvider } from './FilesProvider'
import { FileUploader } from './FileUploader'
import { Canvas } from './Canvas'
import AddText from './AddText'
import { ZoomContainer } from './Zoom/ZoomContainer'
import { ZoomProvider } from './Zoom/ZoomContext'

registerPlugin(FilePondPluginImagePreview, FilePondPluginImageExifOrientation)

function App() {
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    const html2canvas = await import('html2canvas')
    const canvas = await html2canvas.default(canvasRef.current!, { useCORS: true })
    const link = document.createElement('a')
    link.download = 'whiteboard.jpg'
    link.href = canvas.toDataURL('image/jpeg')
    link.click()
  }

  const handleFullDownload = () => {
    if (canvasRef.current) {
      (canvasRef.current as unknown as HTMLElement & { downloadBoard: () => void }).downloadBoard()
    }
  }

  return (
    <FilesProvider>
      <ZoomProvider>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', width: '100%', zIndex: 20, pointerEvents: 'none' }}>
            <header style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', margin: '.5rem 6rem' }}>
              <AddText />
              <FileUploader />
              <button onClick={handleDownload}>Instantánea</button>
              <button onClick={handleFullDownload}>Captura Completa</button>
                <a href="https://github.com/CiroMirkin/WhiteBoardPrototipe" target="_blank">GitHub</a>
            </header>
          </div>
          <ZoomContainer>
            <Canvas ref={canvasRef} />
          </ZoomContainer>
        </div>
      </ZoomProvider>
    </FilesProvider>
  )
}

export default App