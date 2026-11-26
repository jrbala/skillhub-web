import { createContext, useContext } from 'react'
import type { Inscription } from '../services/compte'
import type { AtelierCatalogue } from '../types'

export interface ValeurContexteInscriptions {
  inscriptions: Inscription[]
  inscrits: string[]
  estInscrit: (atelierId: string) => boolean
  placesRestantes: (atelier: AtelierCatalogue) => number
  inscrire: (atelier: AtelierCatalogue) => boolean
  annuler: (atelierId: string) => void
  erreur: string
}

export const ContexteInscriptions = createContext<ValeurContexteInscriptions | null>(null)

export function useInscriptions(): ValeurContexteInscriptions {
  const contexte = useContext(ContexteInscriptions)
  if (!contexte) throw new Error('useInscriptions doit être utilisé dans FournisseurInscriptions.')
  return contexte
}
