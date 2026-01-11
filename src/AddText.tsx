import { useState, type FormEvent } from "react"
import { useFiles } from "./useFiles"
import type { CanvasImage } from "./types"

function AddText(){
    const [text, setText] = useState("")
    const { setUploadedFiles } = useFiles()

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        if(!text.trim()) return
        e.preventDefault()

        console.info(text)
        
        setText("")
        setUploadedFiles((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                src: '',
                x: 100 + (prev.length * 30),
                y: 200,
                zIndex: 1,
                type: 'text',
                value: text,
            } as CanvasImage,
        ])
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input type="text" onChange={(e) => setText(e.target.value)} value={text} />
                <button type="submit">Agregar</button>
            </form>
        </>
    )
}

export default AddText