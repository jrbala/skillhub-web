import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useCompte } from '../hooks/useCompte'
import { ContexteInscriptions, type ValeurContexteInscriptions } from '../hooks/useInscriptions'
import {
  desinscrire,
  inscrire as inscrireAtelier,
  inscriptions as lireInscriptions,
  placesDisponibles,
  type Inscription,
} from '../services/compte'

function lireEtatInscriptions(): { inscriptions: Inscription[]; erreur: string } {
  try {
    return { inscriptions: lireInscriptions(), erreur: '' }
  } catch (cause) {
    return {
      inscriptions: [],
      erreur: cause instanceof Error ? cause.message : 'Stockage des inscriptions indisponible.',
    }
  }
}

export default function FournisseurInscriptions({ children }: { children: ReactNode }) {
  const { utilisateur } = useCompte()
  const [etat, definirEtat] = useState(lireEtatInscriptions)

  useEffect(() => {
    const actualiser = () => definirEtat(lireEtatInscriptions())
    window.addEventListener('storage', actualiser)
    window.addEventListener('skillhub:stockage', actualiser)
    window.addEventListener('pageshow', actualiser)
    return () => {
      window.removeEventListener('storage', actualiser)
      window.removeEventListener('skillhub:stockage', actualiser)
      window.removeEventListener('pageshow', actualiser)
    }
  }, [])

  const valeur = useMemo<ValeurContexteInscriptions>(() => {
    const inscrits = utilisateur
      ? etat.inscriptions.filter(i => i.utilisateurId === utilisateur.id).map(i => i.atelierId)
      : []

    return {
      inscriptions: etat.inscriptions,
      inscrits,
      estInscrit: (atelierId: string) => inscrits.includes(atelierId),
      placesRestantes: atelier => placesDisponibles(atelier, etat.inscriptions),
      inscrire: atelier => inscrireAtelier(atelier),
      annuler: (atelierId: string) => {
        if (!utilisateur) throw new Error('Connectez-vous pour gérer vos inscriptions.')
        desinscrire(atelierId, utilisateur.id)
      },
      erreur: etat.erreur,
    }
  }, [etat.inscriptions, etat.erreur, utilisateur])

  return <ContexteInscriptions value={valeur}>{children}</ContexteInscriptions>
}
