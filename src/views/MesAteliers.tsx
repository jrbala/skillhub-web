import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import EtatCatalogue from '../components/EtatCatalogue'
import TitreDeVue from '../components/TitreDeVue'
import { bouton, codeAtelier, modale, secondaire, section, surtitre } from '../components/styles'
import { useAteliers } from '../hooks/useAteliers'
import { useCompte } from '../hooks/useCompte'
import { useInscriptions } from '../hooks/useInscriptions'
import { estFormateur } from '../services/compte'

export default function MesAteliers() {
  const { utilisateur } = useCompte()
  const { etat, ateliers, ateliersCrees } = useAteliers()
  const { estInscrit, placesRestantes, annuler } = useInscriptions()
  const [selection, definirSelection] = useState<{ id: string; nom: string; prix: number } | null>(null)
  const [message, definirMessage] = useState('')
  const dialogue = useRef<HTMLDialogElement>(null)
  const declencheur = useRef<HTMLButtonElement | null>(null)
  const statut = useRef<HTMLParagraphElement>(null)

  if (!utilisateur) return null

  const formateur = estFormateur(utilisateur)
  const mesAteliers = ateliers.filter(a => estInscrit(a.id))

  return (
    <section className={section}>
      <p className={surtitre}>ESPACE PERSONNEL</p>
      <TitreDeVue titreDocument="Mes ateliers" className="my-2">Mes ateliers</TitreDeVue>
      <p className="mb-6 text-[#53576a]">
        Consultez vos inscriptions en cours, les places restantes et gérez vos ateliers.
      </p>

      <div className="mb-6 flex flex-wrap gap-3">
        <Link to="/profil" className={secondaire}>Tableau de bord</Link>
        <Link to="/ateliers" className={secondaire}>Explorer le catalogue</Link>
        {formateur && <Link to="/ateliers/nouveau" className={bouton}>Créer un atelier</Link>}
      </div>

      <p
        ref={statut}
        tabIndex={-1}
        role="status"
        className="font-bold text-accent-sombre empty:m-0 not-empty:rounded-[10px] not-empty:border not-empty:border-accent not-empty:bg-lavande not-empty:p-4 not-empty:text-[0.875rem]"
      >
        {message}
      </p>

      <EtatCatalogue />

      <h2 className="mt-8 mb-4">Ateliers suivis ({mesAteliers.length})</h2>
      {etat.statut === 'succes' && mesAteliers.length === 0 && (
        <div className="rounded-carte border border-bordure bg-surface px-6 py-10 text-center">
          <span aria-hidden="true" className={`${codeAtelier} mx-auto`}>{'</>'}</span>
          <h3>Aucune inscription pour le moment</h3>
          <p className="mx-auto text-[#53576a]">
            Parcourez le catalogue pour réserver votre prochain atelier SkillHub.
          </p>
          <Link to="/ateliers" className={bouton}>Voir les ateliers</Link>
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
                  <span className="text-[0.875rem] font-bold text-accent-sombre">{a.categorie}</span>
                </div>
                <h3 className="text-[1.25rem] leading-[1.35]">
                  <Link to={`/ateliers/${a.id}`}>{a.nom}</Link>
                </h3>
                <dl className="grid grid-cols-2 gap-4 border-y border-bordure py-4">
                  {[
                    ['Niveau', a.niveau.split(' — ')[0]],
                    ['Places restantes', `${restantes} place${restantes > 1 ? 's' : ''}`],
                    ['Durée', a.duree],
                    ['Modalité', a.modalite.split(', ')[0]],
                  ].map(([nom, valeur]) => (
                    <div key={nom}>
                      <dt className="mb-1 text-[0.75rem] font-bold tracking-[0.04em] text-[#53576a] uppercase">{nom}</dt>
                      <dd className="m-0 text-[0.875rem]">{valeur}</dd>
                    </div>
                  ))}
                </dl>
                <div className="!mt-auto flex flex-wrap items-center justify-between gap-4">
                  <strong className="text-[1.5rem]">{a.prix} €</strong>
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

      {formateur && (
        <div className="mt-12 border-t border-bordure pt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="m-0">Ateliers créés ({ateliersCrees.length})</h2>
            <Link to="/ateliers/nouveau" className={secondaire}>Ajouter un atelier</Link>
          </div>
          {ateliersCrees.length === 0 ? (
            <p className="text-[#53576a]">Aucun atelier créé depuis ce navigateur pour le moment.</p>
          ) : (
            <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {ateliersCrees.map(a => {
                const restantes = placesRestantes(a)
                return (
                  <li key={a.id} className="min-w-0">
                    <article className="flex h-full flex-col gap-4 rounded-carte border border-bordure bg-surface p-6 shadow-carte hover:border-accent [&>*]:m-0">
                      <div className="flex items-center gap-3">
                        <span aria-hidden="true" className={codeAtelier}>{a.code}</span>
                        <span className="text-[0.875rem] font-bold text-accent-sombre">{a.categorie}</span>
                      </div>
                      <h3 className="text-[1.25rem] leading-[1.35]">
                        <Link to={`/ateliers/${a.id}`}>{a.nom}</Link>
                      </h3>
                      <p className="text-[0.875rem] text-[#53576a]">
                        Places restantes : <strong>{restantes}</strong> / {a.places}
                      </p>
                      <Link to={`/ateliers/${a.id}`} className="!mt-auto text-accent-sombre underline underline-offset-[3px]">
                        Ouvrir la fiche →
                      </Link>
                    </article>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      <dialog
        ref={dialogue}
        aria-labelledby="titre-annulation-mes-ateliers"
        aria-describedby="detail-annulation-mes-ateliers"
        className={modale}
        onClose={() => {
          if (declencheur.current?.isConnected) declencheur.current.focus()
          else statut.current?.focus()
        }}
      >
        <h2 id="titre-annulation-mes-ateliers" className="mt-6 mb-2 text-[clamp(1.5rem,4vw,1.875rem)] leading-[1.25]">
          Annuler cette inscription ?
        </h2>
        <p id="detail-annulation-mes-ateliers">
          Vous allez vous désinscrire de « {selection?.nom} » ({selection?.prix} €).
        </p>
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
