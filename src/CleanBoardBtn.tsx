import { useFiles } from './useFiles'

function CleanBoardBtn() {
    const { setUploadedFiles, clearArrows } = useFiles()

    const handleClearBoard = () => {
        if (confirm('¿Estás seguro de limpiar todo el tablero?')) {
            setUploadedFiles([])
            clearArrows()
        }
    }

    return (
        <button onClick={handleClearBoard} className="toolbar-button" data-tooltip="Limpiar tablero">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
            </svg>
        </button>
    )
}

export default CleanBoardBtn
