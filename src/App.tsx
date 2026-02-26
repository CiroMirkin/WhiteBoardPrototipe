import { useRef, useState, useEffect, useCallback } from 'react'
import { registerPlugin } from 'react-filepond'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'

import { WhiteboardProvider } from './store/useWhiteboardStore'
import { Canvas } from './Canvas'
import { Toolbar } from './features/toolbar/Toolbar'

registerPlugin(FilePondPluginImagePreview, FilePondPluginImageExifOrientation)

function App() {
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'image' | 'arrow'>('select')
  
  const exportFns = useRef<{ downloadViewport: () => void; downloadFullBoard: () => void }>({
    downloadViewport: () => {},
    downloadFullBoard: () => {},
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable) {
        return
      }
      
      if (e.key.toLowerCase() === 'v') {
        setActiveTool('select')
      } else if (e.key.toLowerCase() === 't') {
        setActiveTool('text')
      } else if (e.key.toLowerCase() === 'a') {
        setActiveTool('arrow')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleDownload = useCallback(() => {
    exportFns.current.downloadViewport()
  }, [])

  const handleFullDownload = useCallback(() => {
    exportFns.current.downloadFullBoard()
  }, [])

  const handleExportReady = useCallback((fns: { downloadViewport: () => void; downloadFullBoard: () => void }) => {
    exportFns.current = fns
  }, [])

  return (
    <WhiteboardProvider>
      <div style={{ position: 'relative', overflow: 'hidden', width: '100vw', height: '100vh' }}>
        <Toolbar 
          onDownload={handleDownload}
          onFullDownload={handleFullDownload}
          activeTool={activeTool}
          onToolChange={setActiveTool}
        />
        <Canvas activeTool={activeTool} onToolChange={setActiveTool} onExportReady={handleExportReady} />
      </div>
    </WhiteboardProvider>
  )
}

export default App
