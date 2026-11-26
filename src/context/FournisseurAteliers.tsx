import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { chargerAteliers, CLE_ATELIERS_CREES, creerAtelier, lireAteliersCrees } from '../services/ateliers'
import { ContexteAteliers, type ValeurContexteAteliers } from '../hooks/useAteliers'
import type { AtelierCatalogue, EtatRequeteAteliers } from '../types'

export default function FournisseurAteliers({ children }: { children: ReactNode }) {
  const [requete, definirRequete] = useState<EtatRequeteAteliers>({ statut: 'chargement' })
  const [crees, definirCrees] = useState<AtelierCatalogue[]>(() => lireAteliersCrees())
  const [essai, definirEssai] = useState(0)

  useEffect(() => {
    const controleur = new AbortController()
    chargerAteliers(controleur.signal)
      .then(base => {
        if (controleur.signal.aborted) return
        definirRequete(base.length === 0 ? { statut: 'vide' } : { statut: 'succes', donnees: base })
      })
      .catch((cause: unknown) => {
        if (controleur.signal.aborted) return
        definirRequete({
          statut: 'erreur',
          message: cause instanceof Error ? cause.message : 'Chargement impossible.',
        })
      })
    return () => controleur.abort()
  }, [essai])

  useEffect(() => {
    const synchroniser = (e: StorageEvent) => {
      if (e.key === null || e.key === CLE_ATELIERS_CREES) definirCrees(lireAteliersCrees())
    }
    window.addEventListener('storage', synchroniser)
    return () => window.removeEventListener('storage', synchroniser)
  }, [])

  const etat = useMemo<EtatRequeteAteliers>(() => {
    switch (requete.statut) {
      case 'chargement':
      case 'erreur':
        return requete
      case 'vide':
        return crees.length > 0 ? { statut: 'succes', donnees: crees } : { statut: 'vide' }
      case 'succes': {
        const idsBase = new Set(requete.donnees.map(a => a.id))
        const fusion = [...requete.donnees, ...crees.filter(a => !idsBase.has(a.id))]
        return fusion.length === 0 ? { statut: 'vide' } : { statut: 'succes', donnees: fusion }
      }
    }
  }, [requete, crees])

  const ateliers = useMemo(() => (etat.statut === 'succes' ? etat.donnees : []), [etat])
  const ateliersRef = useRef<AtelierCatalogue[]>(ateliers)
  useEffect(() => { ateliersRef.current = ateliers }, [ateliers])

  const reessayer = useCallback(() => {
    definirRequete({ statut: 'chargement' })
    definirEssai(v => v + 1)
  }, [])

  const ajouterAtelier = useCallback(async (titre: string) => {
    const base = requete.statut === 'succes' ? requete.donnees : []
    const existants = [...base, ...crees, ...ateliersRef.current]
    const nouvelAtelier = await creerAtelier(titre, existants)
    definirCrees(precedents =>
      precedents.some(a => a.id === nouvelAtelier.id) ? precedents : [...precedents, nouvelAtelier],
    )
    return nouvelAtelier
  }, [requete, crees])

  const valeur = useMemo<ValeurContexteAteliers>(() => ({
    etat,
    ateliers,
    ateliersCrees: crees,
    chargement: etat.statut === 'chargement',
    erreur: etat.statut === 'erreur' ? etat.message : '',
    reessayer,
    ajouterAtelier,
  }), [etat, ateliers, crees, reessayer, ajouterAtelier])

  return <ContexteAteliers value={valeur}>{children}</ContexteAteliers>
}
