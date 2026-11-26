import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EtatCatalogue from '../components/EtatCatalogue'
import TitreDeVue from '../components/TitreDeVue'
import { bouton, codeAtelier, modale, secondaire, section, surtitre } from '../components/styles'
import { useAteliers } from '../hooks/useAteliers'
import { useCompte } from '../hooks/useCompte'
import { useInscriptions } from '../hooks/useInscriptions'
import { deconnecter, estFormateur } from '../services/compte'

export default function Dashboard() {
  const { utilisateur } = useCompte()
  const { etat, ateliers } = useAteliers()
  const { estInscrit, placesRestantes, annuler } = useInscriptions()
  const [selection, definirSelection] = useState<{ id: string; nom: string; prix: number } | null>(null)
  const [message, definirMessage] = useState('')
  const dialogue = useRef<HTMLDialogElement>(null)
  const declencheur = useRef<HTMLButtonElement | null>(null)
  const statut = useRef<HTMLParagraphElement>(null)
  const naviguer = useNavigate()

  function sortir() {
    try {
      deconnecter()
      naviguer('/')
    } catch (cause) {
      definirMessage(cause instanceof Error ? cause.message : 'Déconnexion impossible.')
    }
  }

  if (!utilisateur) return null

  const formateur = estFormateur(utilisateur)
  const mesAteliers = ateliers.filter(a => estInscrit(a.id))

  return (
    <section className={section}>
      <p className={surtitre}>VOTRE PARCOURS SKILLHUB</p>
      <TitreDeVue titreDocument="Tableau de bord" className="my-2">Mon espace</TitreDeVue>
      <p className="mb-8 text-[#53576a]">Retrouvez vos ateliers suivis, les places restantes et préparez votre prochaine étape.</p>

      <div className="mb-6 flex flex-wrap items-center gap-5 rounded-carte border border-bordure bg-surface p-6 md:flex-nowrap">
        <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-carte bg-lavande text-[1.5rem] font-bold text-accent-sombre">
          {utilisateur.nom.trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="m-0 text-[1.25rem]">{utilisateur.nom}</h2>
            <span className="rounded-md bg-lavande px-2 py-1 text-[0.75rem] font-bold text-accent-sombre">
              {formateur ? 'Formateur' : 'Apprenant'}
            </span>
          </div>
          <p className="m-0 text-[0.9375rem] text-[#53576a] [overflow-wrap:anywhere]">{utilisateur.email}</p>
        </div>
        <p className="m-0 ml-auto w-full shrink-0 border-t border-bordure pt-4 md:w-auto md:border-t-0 md:border-l md:pt-0 md:pl-6">
          <strong className="block text-[1.75rem] text-accent-sombre">{mesAteliers.length}</strong>
          <span className="text-[0.8125rem] text-[#53576a]">Inscriptions</span>
        </p>
      </div>

      <p
        ref={statut}
        tabIndex={-1}
        role="status"
        className="font-bold text-accent-sombre empty:m-0 not-empty:rounded-[10px] not-empty:border not-empty:border-accent not-empty:bg-lavande not-empty:p-4 not-empty:text-[0.875rem]"
      >
        {message}
      </p>

      <div className="mt-8 mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 className="m-0">Ateliers suivis</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/mes-ateliers" className={secondaire}>Mes ateliers</Link>
          <Link to="/ateliers" className={secondaire}>Explorer les ateliers</Link>
          {formateur && <Link to="/ateliers/nouveau" className={bouton}>Créer un atelier</Link>}
        </div>
      </div>

      <EtatCatalogue />

      {etat.statut === 'succes' && mesAteliers.length === 0 && (
        <div className="rounded-carte border border-bordure bg-surface px-6 py-10 text-center">
          <span aria-hidden="true" className={`${codeAtelier} mx-auto`}>{'</>'}</span>
          <h3>Votre prochain atelier vous attend</h3>
          <p className="mx-auto text-[#53576a]">
            Vous n’êtes encore inscrit à aucun atelier. Choisissez un sujet et commencez à apprendre avec nous.
          </p>
          <Link to="/ateliers" className={bouton}>Découvrir les ateliers</Link>
        </div>
      )}

      <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {mesAteliers.map(a => {
          const restantes = placesRestantes(a)
          return (
            <li key={a.id} className="min-w-0">
              <article className="flex h-full flex-col gap-5 rounded-carte border border-bordure bg-surface p-6 shadow-carte hover:border-accent [&>*]:m-0">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className={codeAtelier}>{a.code}</span>
                  <span className="text-[0.875rem] font-bold text-accent-sombre">Inscription confirmée</span>
                </div>
                <h3 className="text-[1.375rem] leading-[1.35]">
                  <Link to={`/ateliers/${a.id}`}>{a.nom}</Link>
                </h3>
                <dl className="grid grid-cols-2 gap-4 border-y border-bordure py-5">
                  {[
                    ['Niveau', a.niveau],
                    ['Places restantes', `${restantes} place${restantes > 1 ? 's' : ''}`],
                    ['Durée', a.duree],
                    ['Horaires', a.horaires],
                    ['Modalité', a.modalite],
                  ].map(([nom, valeur]) => (
                    <div key={nom}>
                      <dt className="mb-1 text-[0.75rem] font-bold tracking-[0.04em] text-[#53576a] uppercase">{nom}</dt>
                      <dd className="m-0 text-[0.875rem]">{valeur}</dd>
                    </div>
                  ))}
                </dl>
                <div className="!mt-auto flex flex-wrap items-center justify-between gap-4">
                  <p className="m-0">
                    <span className="block text-[0.75rem] text-[#53576a]">Prix de l’atelier</span>
                    <strong className="text-[1.75rem]">{a.prix} €</strong>
                  </p>
                  <button
                    aria-label={`Se désinscrire de ${a.nom}`}
                    className="cursor-pointer rounded-lg border border-erreur bg-surface px-4 py-[0.7rem] whitespace-nowrap text-erreur hover:bg-[#fff4f2]"
                    onClick={e => {
                      declencheur.current = e.currentTarget
                      definirSelection({ id: a.id, nom: a.nom, prix: a.prix })
                      dialogue.current?.showModal()
                    }}
                  >
                    Se désinscrire
                  </button>
                </div>
              </article>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-bordure pt-6">
        <Link to="/" className="text-accent-sombre underline">← Retour à l’accueil</Link>
        <button className={secondaire} onClick={sortir}>Se déconnecter</button>
      </div>

      <dialog
        ref={dialogue}
        aria-labelledby="titre-annulation"
        aria-describedby="detail-annulation"
        className={modale}
        onClose={() => {
          if (declencheur.current?.isConnected) declencheur.current.focus()
          else statut.current?.focus()
        }}
      >
        <h2 id="titre-annulation" className="mt-6 mb-2 text-[clamp(1.5rem,4vw,1.875rem)] leading-[1.25]">
          Annuler cette inscription ?
        </h2>
        <p id="detail-annulation">
          Vous allez vous désinscrire de « {selection?.nom} » ({selection?.prix} €).
        </p>
        <p>Vous pourrez vous inscrire à nouveau depuis la liste des ateliers.</p>
        <div className="flex flex-wrap items-center gap-4">
          <button autoFocus className={secondaire} onClick={() => dialogue.current?.close()}>
            Garder mon inscription
          </button>
          <button
            className="cursor-pointer rounded-lg border border-erreur bg-erreur px-6 py-3 text-surface hover:bg-[#861b12]"
            onClick={() => {
              if (!selection) return
              try {
                annuler(selection.id)
                definirMessage(`Votre inscription à « ${selection.nom} » a été annulée.`)
              } catch (cause) {
                definirMessage(cause instanceof Error ? cause.message : 'Annulation impossible.')
              }
              dialogue.current?.close()
            }}
          >
            Annuler l’inscription
          </button>
        </div>
      </dialog>
    </section>
  )
}
