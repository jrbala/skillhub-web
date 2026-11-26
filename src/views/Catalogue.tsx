import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { champ, etiquetteChamp, secondaire, section } from '../components/styles'
import RechercheAteliers from '../components/RechercheAteliers'
import CarteAtelier from '../components/CarteAtelier'
import TitreDeVue from '../components/TitreDeVue'
import { useAteliers } from '../hooks/useAteliers'
import { useCompte } from '../hooks/useCompte'
import { useInscriptions } from '../hooks/useInscriptions'
import { useInscription } from '../hooks/useInscription'
import { estFormateur } from '../services/compte'
import type { EtatRequeteAteliers } from '../types'

const NIVEAUX_VALIDES = ['Débutant', 'Intermédiaire', 'Tous niveaux']
const TRIS_VALIDES = ['croissant', 'decroissant']

function normaliser(texte: string) {
  return texte.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').trim()
}

export default function Catalogue({ accueil = false }: { accueil?: boolean }) {
  const { etat, ateliers, reessayer } = useAteliers()
  const { utilisateur } = useCompte()
  const { estInscrit, placesRestantes } = useInscriptions()
  const { reserver, message } = useInscription()
  const [params, definirParams] = useSearchParams()
  const [filtresLocaux, definirFiltresLocaux] = useState({ recherche: '', niveau: '', tri: '', disponible: false })
  const [bords, definirBords] = useState({ debut: true, fin: false })
  const carrousel = useRef<HTMLUListElement>(null)

  const formateur = estFormateur(utilisateur)
  const recherche = accueil ? filtresLocaux.recherche : (params.get('q') ?? '')
  const niveauBrut = accueil ? filtresLocaux.niveau : (params.get('niveau') ?? '')
  const niveau = NIVEAUX_VALIDES.includes(niveauBrut) ? niveauBrut : ''
  const triBrut = accueil ? filtresLocaux.tri : (params.get('tri') ?? '')
  const tri = TRIS_VALIDES.includes(triBrut) ? triBrut : ''
  const disponible = accueil ? filtresLocaux.disponible : params.get('disponible') === '1'
  const aFiltresActifs = Boolean(recherche.trim() || niveau || tri || disponible)

  function mettreAJourFiltre(cle: 'q' | 'niveau' | 'tri' | 'disponible', valeur: string | boolean) {
    if (accueil) {
      definirFiltresLocaux(precedent => ({
        ...precedent,
        ...(cle === 'q' ? { recherche: String(valeur) } : {}),
        ...(cle === 'niveau' ? { niveau: String(valeur) } : {}),
        ...(cle === 'tri' ? { tri: String(valeur) } : {}),
        ...(cle === 'disponible' ? { disponible: Boolean(valeur) } : {}),
      }))
      return
    }
    const suivants = new URLSearchParams(params)
    if (typeof valeur === 'boolean') {
      if (valeur) suivants.set(cle, '1')
      else suivants.delete(cle)
    } else if (valeur) {
      suivants.set(cle, valeur)
    } else {
      suivants.delete(cle)
    }
    definirParams(suivants, { replace: true })
  }

  function reinitialiser() {
    if (accueil) {
      definirFiltresLocaux({ recherche: '', niveau: '', tri: '', disponible: false })
      return
    }
    const suivants = new URLSearchParams(params)
    for (const cle of ['q', 'niveau', 'tri', 'disponible']) suivants.delete(cle)
    definirParams(suivants, { replace: true })
  }

  const resultats = useMemo(() => {
    if (etat.statut !== 'succes') return []
    return etat.donnees
      .filter(a =>
        normaliser(`${a.nom} ${a.description} ${a.formateur}`).includes(normaliser(recherche))
        && (!niveau || a.niveau.startsWith(niveau))
        && (!disponible || (a.ouvert && placesRestantes(a) > 0)),
      )
      .sort((a, b) => tri === 'croissant' ? a.prix - b.prix : tri === 'decroissant' ? b.prix - a.prix : 0)
  }, [etat, recherche, niveau, tri, disponible, placesRestantes])

  const etatAffichage = useMemo<EtatRequeteAteliers>(() => {
    switch (etat.statut) {
      case 'chargement':
      case 'erreur':
      case 'vide':
        return etat
      case 'succes':
        return resultats.length === 0 ? { statut: 'vide' } : { statut: 'succes', donnees: resultats }
    }
  }, [etat, resultats])

  const signature = resultats.map(a => a.id).join(',')

  useEffect(() => {
    const liste = carrousel.current
    if (!liste || !accueil) return
    const actualiser = () => definirBords({
      debut: liste.scrollLeft <= 1,
      fin: liste.scrollLeft >= liste.scrollWidth - liste.clientWidth - 1,
    })
    liste.scrollLeft = 0
    const observateur = new ResizeObserver(actualiser)
    observateur.observe(liste)
    liste.addEventListener('scroll', actualiser)
    return () => {
      observateur.disconnect()
      liste.removeEventListener('scroll', actualiser)
    }
  }, [accueil, signature])

  function defiler(direction: number) {
    const liste = carrousel.current
    if (liste) {
      liste.scrollBy({
        left: direction * ((liste.firstElementChild?.clientWidth ?? 0) + 16),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      })
    }
  }

  function rendreContenuCatalogue() {
    switch (etatAffichage.statut) {
      case 'chargement':
        return (
          <div
            aria-busy="true"
            role="status"
            aria-live="polite"
            className={`my-6 rounded-carte border border-bordure bg-surface p-6 text-center ${accueil ? 'min-h-[22rem]' : 'min-h-[60vh]'}`}
          >
            <p className="m-0 font-bold text-accent-sombre">Chargement des ateliers…</p>
            <p className="mx-auto mt-2 mb-0 text-[0.9375rem] text-[#53576a]">
              Récupération du catalogue en cours depuis l’API SkillHub.
            </p>
          </div>
        )
      case 'erreur':
        return (
          <div role="alert" className="my-6 rounded-carte border border-erreur bg-[#fff4f2] p-6">
            <p className="mt-0 font-bold text-erreur">{etatAffichage.message}</p>
            <button type="button" className={secondaire} onClick={reessayer}>
              Réessayer
            </button>
          </div>
        )
      case 'vide':
        return (
          <div
            role="status"
            aria-live="polite"
            className="my-6 rounded-carte border border-bordure bg-surface p-6 text-center"
          >
            {aFiltresActifs ? (
              <>
                <p className="mt-0 font-bold">Aucun atelier trouvé pour ces filtres.</p>
                <p className="mx-auto text-[#53576a]">
                  Essayez un autre mot-clé, un autre niveau ou réinitialisez les filtres.
                </p>
                <button type="button" className={secondaire} onClick={reinitialiser}>
                  Réinitialiser les filtres
                </button>
              </>
            ) : (
              <>
                <p className="mt-0 font-bold">Aucun atelier disponible pour le moment.</p>
                <p className="mx-auto text-[#53576a]">
                  Le catalogue renvoyé par l’API est actuellement vide. Actualisez la page ou revenez plus tard.
                </p>
                <button type="button" className={secondaire} onClick={reessayer}>
                  Actualiser
                </button>
              </>
            )}
          </div>
        )
      case 'succes': {
        const nombre = etatAffichage.donnees.length
        return (
          <>
            <p role="status" aria-live="polite" className="mt-5 mb-3 text-sm text-[#53576a]">
              {nombre} atelier{nombre !== 1 ? 's' : ''} trouvé{nombre !== 1 ? 's' : ''}.
            </p>
            <div className="relative flex items-center">
              {accueil && (
                <button
                  type="button"
                  hidden={bords.debut || !nombre}
                  aria-label="Voir les ateliers précédents"
                  className="absolute top-1/2 -left-4 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-bordure bg-surface shadow-[0_4px_18px_rgb(37_40_58/10%)] hover:border-accent hover:text-accent-sombre"
                  onClick={() => defiler(-1)}
                >
                  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15 19-7-7 7-7" />
                  </svg>
                </button>
              )}
              <ul
                ref={carrousel}
                aria-label="Ateliers"
                className={
                  accueil
                    ? 'm-0 grid w-full auto-cols-[100%] grid-flow-col snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] md:auto-cols-[calc(50%-0.5rem)] [&::-webkit-scrollbar]:hidden'
                    : 'm-0 grid w-full list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3'
                }
              >
                {etatAffichage.donnees.map(atelier => (
                  <li key={atelier.id} className="min-w-0 snap-start">
                    <CarteAtelier
                      atelier={{ ...atelier, places: placesRestantes(atelier) }}
                      inscrit={estInscrit(atelier.id)}
                      onInscrire={() => reserver(atelier)}
                      inscriptionDirecte={!accueil}
                    />
                  </li>
                ))}
              </ul>
              {accueil && (
                <button
                  type="button"
                  hidden={bords.fin || !nombre}
                  aria-label="Voir les ateliers suivants"
                  className="absolute top-1/2 -right-4 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-bordure bg-surface shadow-[0_4px_18px_rgb(37_40_58/10%)] hover:border-accent hover:text-accent-sombre"
                  onClick={() => defiler(1)}
                >
                  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </>
        )
      }
    }
  }

  return (
    <section id="ateliers" tabIndex={-1} className={section}>
      {accueil ? (
        <h2>Nos ateliers</h2>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <TitreDeVue titreDocument="Les ateliers" className="m-0">Les ateliers SkillHub</TitreDeVue>
          {formateur && <Link to="/ateliers/nouveau" className={secondaire}>Créer un atelier</Link>}
        </div>
      )}
      <p>Ateliers de démonstration : aucune réservation réelle ni aucun paiement.</p>
      <p role="status" className="font-bold text-accent-sombre empty:m-0">{message}</p>
      <form
        role="search"
        aria-label="Filtrer les ateliers"
        className="grid w-full grid-cols-2 items-end gap-4 rounded-carte border border-bordure bg-surface p-4 shadow-carte md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] md:p-5"
        onSubmit={e => e.preventDefault()}
        onReset={e => {
          e.preventDefault()
          reinitialiser()
          e.currentTarget.querySelector<HTMLInputElement>('input[type="search"]')?.focus()
        }}
      >
        <RechercheAteliers ateliers={ateliers} recherche={recherche} modifier={valeur => mettreAJourFiltre('q', valeur)} />
        <div className="min-w-0">
          <label htmlFor="niveau" className={etiquetteChamp}>Niveau</label>
          <select id="niveau" value={niveau} onChange={e => mettreAJourFiltre('niveau', e.target.value)} className={champ}>
            <option value="">Sans filtre</option>
            {NIVEAUX_VALIDES.map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
        <div className="min-w-0">
          <label htmlFor="tri" className={etiquetteChamp}>Trier par prix</label>
          <select id="tri" value={tri} onChange={e => mettreAJourFiltre('tri', e.target.value)} className={champ}>
            <option value="">Par défaut</option>
            <option value="croissant">Prix croissant</option>
            <option value="decroissant">Prix décroissant</option>
          </select>
        </div>
        {(!accueil || aFiltresActifs) && (
          <div className="col-span-full flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-bordure pt-3 text-sm">
            {!accueil && (
              <label className="flex min-h-9 items-center gap-2 font-bold">
                <input type="checkbox" checked={disponible} onChange={e => mettreAJourFiltre('disponible', e.target.checked)} className="size-4 accent-accent" />
                Places disponibles uniquement
              </label>
            )}
            {aFiltresActifs && <button type="reset" className="ml-auto min-h-9 cursor-pointer text-accent-sombre underline underline-offset-4">Réinitialiser les filtres</button>}
          </div>
        )}
      </form>
      {!accueil && <h2 className="sr-only">Liste des ateliers</h2>}
      {rendreContenuCatalogue()}
    </section>
  )
}
