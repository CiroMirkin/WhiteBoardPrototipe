import { useEffect } from 'react'
import type { Arrow } from '../../types'

interface UseArrowKeyboardShortcutsOptions {
  arrows: Arrow[]
  removeArrow: (id: string) => void
}

export const useArrowKeyboardShortcuts = ({ arrows, removeArrow }: UseArrowKeyboardShortcutsOptions) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedArrow = arrows.find(a => a.selected)
        if (selectedArrow) {
          removeArrow(selectedArrow.id)
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [arrows, removeArrow])
}
