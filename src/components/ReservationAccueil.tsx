import { Link } from 'react-router-dom'
import { useAteliers } from '../hooks/useAteliers'
import Reservation from './Reservation'
import { bouton } from './styles'

export default function ReservationAccueil() {
  const { etat, reessayer } = useAteliers()

  switch (etat.statut) {
    case 'chargement':
      return <button type="button" className={bouton} disabled aria-busy="true">Chargement…</button>
    case 'erreur':
      return <button type="button" className={bouton} onClick={reessayer}>Réessayer</button>
    case 'vide':
      return <p className="m-0 text-[0.9375rem] text-[#53576a]">Aucun atelier disponible pour le moment.</p>
    case 'succes': {
      const atelier = etat.donnees.find(a => a.id === 'html')
      if (atelier) {
        return (
          <Reservation
            atelier={atelier}
            accueil
            description="Apprenez à organiser le contenu d’une page web et créez vos premières pages, pas à pas."
          />
        )
      }
      return <Link to="/ateliers" className={bouton}>Découvrir les ateliers</Link>
    }
  }
}
