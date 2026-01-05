import { registerPlugin } from 'react-filepond'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'

import { FilesProvider } from './FilesContext'
import { FileUploader } from './FileUploader'
import { Canvas } from './Canvas'

registerPlugin(FilePondPluginImagePreview, FilePondPluginImageExifOrientation)

function App() {
  return (
    <FilesProvider>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', width: '100%', zIndex: 20, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <FileUploader />
          </div>
        </div>
        <Canvas />
      </div>
    </FilesProvider>
  )
}

export default App