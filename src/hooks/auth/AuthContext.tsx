
import { createContext } from 'react';
import { AuthContextType } from './types';

// Cria o contexto com tipo definido
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
