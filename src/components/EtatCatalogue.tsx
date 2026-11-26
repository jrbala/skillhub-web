import { useAteliers } from '../hooks/useAteliers'
import { secondaire } from './styles'

interface PropsEtatCatalogue {
  afficherVide?: boolean
}

export default function EtatCatalogue({ afficherVide = true }: PropsEtatCatalogue) {
  const { etat, reessayer } = useAteliers()

  switch (etat.statut) {
    case 'chargement':
      return (
        <div
          aria-busy="true"
          role="status"
          aria-live="polite"
          className="my-4 rounded-carte border border-bordure bg-surface p-5"
        >
          <p className="m-0 font-bold text-accent-sombre">Chargement des ateliers…</p>
        </div>
      )
    case 'erreur':
      return (
        <div role="alert" className="my-4 rounded-carte border border-erreur bg-[#fff4f2] p-5">
          <p className="mt-0 font-bold text-erreur">{etat.message}</p>
          <button type="button" className={secondaire} onClick={reessayer}>
            Réessayer
          </button>
        </div>
      )
    case 'vide':
      if (!afficherVide) return null
      return (
        <div role="status" aria-live="polite" className="my-4 rounded-carte border border-bordure bg-surface p-5">
          <p className="m-0 text-[#53576a]">Aucun atelier n’est disponible dans le catalogue pour le moment.</p>
        </div>
      )
    case 'succes':
      return null
  }
}
