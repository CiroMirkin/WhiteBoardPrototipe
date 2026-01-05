import { createContext } from 'react';
import type { FilesContextType } from './FilesContext';


export const FilesContext = createContext<FilesContextType | undefined>(undefined);
