import { useRef, useState, useEffect } from 'react'
import { registerPlugin } from 'react-filepond'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'

import { FilesProvider } from './FilesProvider'
import { Canvas } from './Canvas'
import { ZoomContainer } from './Zoom/ZoomContainer'
import { ZoomProvider } from './Zoom/ZoomContext'
import { Header } from './components/Header'

registerPlugin(FilePondPluginImagePreview, FilePondPluginImageExifOrientation)

function App() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [activeTool, setActiveTool] = useState<'text' | 'image' | 'arrow'>('arrow')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable) {
        return
      }
      
      if (e.key.toLowerCase() === 't') {
        setActiveTool('text')
      } else if (e.key.toLowerCase() === 'a') {
        setActiveTool('arrow')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleDownload = async () => {
    const html2canvas = await import('html2canvas')
    const canvas = await html2canvas.default(canvasRef.current!, { useCORS: true, scale: 3 })
    const link = document.createElement('a')
    link.download = 'whiteboard.png'
    link.href = canvas.toDataURL('image/png')
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
          <Header 
            onDownload={handleDownload}
            onFullDownload={handleFullDownload}
            activeTool={activeTool}
            onToolChange={setActiveTool}
          />
          <ZoomContainer>
            <Canvas ref={canvasRef} activeTool={activeTool} />
          </ZoomContainer>
        </div>
      </ZoomProvider>
    </FilesProvider>
  )
}

export default App