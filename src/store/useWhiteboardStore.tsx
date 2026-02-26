import { createContext, useContext, useCallback, useState } from 'react'
import { useLocalStorage } from '@uidotdev/usehooks'
import type { CanvasImage, Arrow } from '../types'

interface WhiteboardState {
  items: CanvasImage[]
  arrows: Arrow[]
  selectedId: string | null
}

interface WhiteboardActions {
  setItems: React.Dispatch<React.SetStateAction<CanvasImage[]>>
  addItem: (item: CanvasImage) => void
  updateItem: (id: string, updates: Partial<CanvasImage>) => void
  removeItem: (id: string) => void
  clearItems: () => void
  setArrows: React.Dispatch<React.SetStateAction<Arrow[]>>
  addArrow: (arrow: Arrow) => void
  updateArrow: (id: string, updates: Partial<Arrow>) => void
  removeArrow: (id: string) => void
  clearArrows: () => void
  setSelectedId: (id: string | null) => void
}

type WhiteboardStore = WhiteboardState & WhiteboardActions

const WhiteboardContext = createContext<WhiteboardStore | undefined>(undefined)

export const WhiteboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useLocalStorage<CanvasImage[]>('whiteboard-items', [])
  const [arrows, setArrows] = useLocalStorage<Arrow[]>('whiteboard-arrows', [])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const addItem = useCallback((item: CanvasImage) => {
    setItems(prev => [...prev, item])
  }, [setItems])

  const updateItem = useCallback((id: string, updates: Partial<CanvasImage>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
  }, [setItems])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [setItems])

  const clearItems = useCallback(() => {
    setItems([])
  }, [setItems])

  const addArrow = useCallback((arrow: Arrow) => {
    setArrows(prev => [...prev, arrow])
  }, [setArrows])

  const updateArrow = useCallback((id: string, updates: Partial<Arrow>) => {
    setArrows(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
  }, [setArrows])

  const removeArrow = useCallback((id: string) => {
    setArrows(prev => prev.filter(a => a.id !== id))
  }, [setArrows])

  const clearArrows = useCallback(() => {
    setArrows([])
  }, [setArrows])

  const store: WhiteboardStore = {
    items,
    arrows,
    selectedId,
    setItems,
    addItem,
    updateItem,
    removeItem,
    clearItems,
    setArrows,
    addArrow,
    updateArrow,
    removeArrow,
    clearArrows,
    setSelectedId,
  }

  return (
    <WhiteboardContext.Provider value={store}>
      {children}
    </WhiteboardContext.Provider>
  )
}

export const useWhiteboardStore = () => {
  const context = useContext(WhiteboardContext)
  if (!context) {
    throw new Error('useWhiteboardStore must be used within a WhiteboardProvider')
  }
  return context
}
