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
  return (
    <FilesProvider>
      <ZoomProvider>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', width: '100%', zIndex: 20, pointerEvents: 'none' }}>
            <header style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', margin: '.5rem 6rem' }}>
              <AddText />
              <FileUploader />
               <a href="https://github.com/CiroMirkin/WhiteBoardPrototipe" target="_blank">GitHub</a>
            </header>
          </div>
          <ZoomContainer>
            <Canvas />
          </ZoomContainer>
        </div>
      </ZoomProvider>
    </FilesProvider>
  )
}

export default App