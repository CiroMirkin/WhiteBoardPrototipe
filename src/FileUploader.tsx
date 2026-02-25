import { FilePond } from 'react-filepond'
import type { ProcessServerConfigFunction } from 'filepond'
import { useFiles } from './useFiles'
import type { CanvasImage } from './types'

export function FileUploader() {
    const { setUploadedFiles } = useFiles()

    const readFile = (file: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
            img.onerror = reject
            img.src = src
        })
    }

    const processFile: ProcessServerConfigFunction = async (
        _fieldName,
        file,
        _metadata,
        load,
        error
    ) => {
        try {
            const result = await readFile(file as Blob)
            const id = Math.random().toString(36).substring(2, 9)
            
            const dimensions = await getImageDimensions(result)
            const maxSize = 400
            let width = dimensions.width
            let height = dimensions.height
            
            if (width > maxSize || height > maxSize) {
                const scale = maxSize / Math.max(width, height)
                width = Math.round(width * scale)
                height = Math.round(height * scale)
            }

            setUploadedFiles((prev) => [
                ...prev,
                {
                    id,
                    src: result,
                    x: 100 + (prev.length * 30),
                    y: 200,
                    zIndex: 1,
                    type: 'img',
                    width,
                    height,
                } as CanvasImage,
            ])

            load(id)
        } catch (e) {
            console.error(e)
            error('Error al procesar')
        }
    }

    return (
        <div style={{ width: '500px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
            <FilePond
                allowMultiple={true}
                maxFiles={40}
                maxParallelUploads={1}
                server={{ process: processFile, revert: null }}
                labelIdle='Arrastra fotos aquí o <span class="filepond--label-action">selecciona</span>'
            />
        </div>
    )
}
