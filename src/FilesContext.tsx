import { createContext } from 'react'
import type { FilesContextType } from './types'

export const FilesContext = createContext<FilesContextType | undefined>(undefined)
