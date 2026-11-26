import { createContext, useContext } from 'react'
import type { AtelierCatalogue, EtatRequeteAteliers } from '../types'

export interface ValeurContexteAteliers {
  etat: EtatRequeteAteliers
  ateliers: AtelierCatalogue[]
  ateliersCrees: AtelierCatalogue[]
  chargement: boolean
  erreur: string
  reessayer: () => void
  ajouterAtelier: (titre: string) => Promise<AtelierCatalogue>
}

export const ContexteAteliers = createContext<ValeurContexteAteliers>({
  etat: { statut: 'chargement' },
  ateliers: [],
  ateliersCrees: [],
  chargement: true,
  erreur: '',
  reessayer: () => {},
  ajouterAtelier: async () => { throw new Error('Contexte ateliers indisponible.') },
})

export const useAteliers = () => useContext(ContexteAteliers)
