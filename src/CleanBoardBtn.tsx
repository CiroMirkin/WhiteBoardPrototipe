import { useFiles } from './useFiles'

function CleanBoardBtn() {
    const { setUploadedFiles } = useFiles()

    const handleClearBoard = () => {
        setUploadedFiles([])
    }

    return (
        <button onClick={handleClearBoard}>Limpiar Tablero</button>
    )
}

export default CleanBoardBtn