import { useState, type FormEvent } from "react"
import { useFiles } from "./useFiles"
import type { CanvasImage } from "./types"

interface AddTextProps {
  isActive?: boolean
}

function AddText({ isActive }: AddTextProps) {
  const [text, setText] = useState("")
  const { setUploadedFiles } = useFiles()

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (!text.trim()) return
    e.preventDefault()

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
        width: 800,
        fontSize: 20,
      } as CanvasImage,
    ])
    setText("")
  }

  if (!isActive) return null

  return (
    <form onSubmit={handleSubmit} className="add-text-form">
      <input
        type="text"
        onChange={(e) => setText(e.target.value)}
        value={text}
        placeholder="Escribe algo..."
        className="add-text-input"
        autoFocus
      />
      <button type="submit" className="add-text-button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </form>
  )
}

export default AddText
