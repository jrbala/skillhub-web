import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import TitreDeVue from '../components/TitreDeVue'
import { bouton, secondaire, surtitre } from '../components/styles'
import { useAteliers } from '../hooks/useAteliers'
import type { AtelierCatalogue } from '../types'

const LONGUEUR_MINIMALE = 5

export default function CreerAtelier() {
  const { ajouterAtelier } = useAteliers()
  const [titre, definirTitre] = useState('')
  const [erreurTitre, definirErreurTitre] = useState('')
  const [message, definirMessage] = useState('')
  const [dernierAtelier, definirDernierAtelier] = useState<AtelierCatalogue | null>(null)
  const [enCours, definirEnCours] = useState(false)
  const verrou = useRef(false)
  const champTitre = useRef<HTMLInputElement>(null)
  const statut = useRef<HTMLParagraphElement>(null)

  function modifierTitre(valeur: string) {
    definirTitre(valeur)
    if (erreurTitre && valeur.trim().length >= LONGUEUR_MINIMALE) {
      definirErreurTitre('')
    }
  }

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (verrou.current) return

    const titreNettoye = titre.trim()
    if (!titreNettoye) {
      definirErreurTitre('Le titre de l’atelier est obligatoire (au moins 5 caractères).')
      definirMessage('')
      definirDernierAtelier(null)
      champTitre.current?.focus()
      return
    }
    if (titreNettoye.length < LONGUEUR_MINIMALE) {
      definirErreurTitre(`Le titre doit contenir au moins ${LONGUEUR_MINIMALE} caractères.`)
      definirMessage('')
      definirDernierAtelier(null)
      champTitre.current?.focus()
      return
    }

    definirErreurTitre('')
    definirMessage('')
    definirDernierAtelier(null)
    verrou.current = true
    definirEnCours(true)

    try {
      const atelierCree = await ajouterAtelier(titreNettoye)
      definirTitre('')
      definirDernierAtelier(atelierCree)
      definirMessage(`L’atelier « ${atelierCree.nom} » a été ajouté au catalogue.`)
      statut.current?.focus()
    } catch (cause) {
      definirErreurTitre(cause instanceof Error ? cause.message : 'Enregistrement impossible.')
      champTitre.current?.focus()
    } finally {
      verrou.current = false
      definirEnCours(false)
    }
  }

  return (
    <section className="mx-auto grid w-full max-w-contenu gap-8 px-6 py-10 md:grid-cols-[0.9fr_1.1fr] md:items-start md:gap-10 md:py-16 lg:gap-20">
      <div className="self-center">
        <p className={surtitre}>CONTRIBUER AU CATALOGUE</p>
        <TitreDeVue
          titreDocument="Créer un atelier"
          description="Ajoutez un nouvel atelier au catalogue de démonstration SkillHub."
          className="my-4 leading-[1.15] md:max-w-[14ch]"
        >
          Créer un atelier
        </TitreDeVue>
        <p className="!max-w-[38ch] text-[#53576a]">
          Ajoutez un nouvel atelier de démonstration. Il apparaîtra immédiatement dans le catalogue et restera ouvert aux inscriptions des élèves.
        </p>
        <ul className="my-8 hidden list-none gap-3 p-0 md:grid">
          {[
            'Visible aussitôt dans la liste des ateliers',
            'Fiche détaillée générée automatiquement',
            'Parcours d’inscription élève préservé',
          ].map(texte => (
            <li key={texte} className="flex gap-[0.65rem] text-[0.9375rem]">
              <span aria-hidden="true" className="font-bold text-accent-sombre">✓</span>
              {texte}
            </li>
          ))}
        </ul>
        <Link to="/ateliers" className="text-accent-sombre underline underline-offset-[3px]">
          ← Retour aux ateliers
        </Link>
      </div>

      <div className="min-w-0 rounded-[20px] border border-bordure bg-surface p-6 shadow-[0_12px_40px_rgb(37_40_58/6%)] md:p-8 lg:p-10">
        <h2 className="m-0 text-[1.5rem]">Nouvel atelier</h2>
        <p className="mt-[0.4rem] mb-6 text-[#53576a]">
          Indiquez le titre de l’atelier à enregistrer dans le catalogue local.
        </p>

        <form noValidate onSubmit={envoyer} aria-busy={enCours}>
          <div className="mb-5">
            <label htmlFor="titre-atelier" className="mb-2 block text-[0.875rem] font-bold">
              Titre de l’atelier
            </label>
            <input
              ref={champTitre}
              id="titre-atelier"
              name="titre"
              type="text"
              required
              minLength={LONGUEUR_MINIMALE}
              value={titre}
              onChange={e => modifierTitre(e.target.value)}
              disabled={enCours}
              aria-invalid={Boolean(erreurTitre)}
              aria-describedby={erreurTitre ? 'erreur-titre-atelier aide-titre-atelier' : 'aide-titre-atelier'}
              placeholder="Ex. : Atelier tests unitaires React"
              className="w-full rounded-[9px] border border-[#85899a] bg-[#fcfcfe] px-4 py-[0.8rem] aria-invalid:border-erreur focus-visible:bg-surface focus-visible:outline-accent focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-75"
            />
            <p id="erreur-titre-atelier" role="alert" className="mt-2 mb-0 text-[0.875rem] text-erreur empty:m-0">
              {erreurTitre}
            </p>
            <p id="aide-titre-atelier" className="mt-[0.4rem] mb-0 text-[0.8125rem] text-[#53576a]">
              Au moins 5 caractères après suppression des espaces en début et fin.
            </p>
          </div>

          <button type="submit" disabled={enCours} className={`${bouton} mt-6 !block w-full font-bold`}>
            {enCours ? 'Enregistrement en cours…' : 'Créer l’atelier'}
          </button>

          <p
            ref={statut}
            tabIndex={-1}
            role="status"
            className="mt-5 mb-0 font-bold text-accent-sombre empty:m-0 not-empty:rounded-[10px] not-empty:border not-empty:border-accent not-empty:bg-lavande not-empty:p-4 not-empty:text-[0.875rem]"
          >
            {message}
          </p>

          {dernierAtelier && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to={`/ateliers/${dernierAtelier.id}`} className={secondaire}>
                Voir la fiche de l’atelier
              </Link>
              <Link to="/ateliers" className="self-center text-accent-sombre underline underline-offset-[3px]">
                Voir dans le catalogue
              </Link>
            </div>
          )}
        </form>

        <p className="mt-6 mb-0 border-t border-bordure pt-5 text-center text-[0.75rem] text-[#53576a]">
          Catalogue local de démonstration : les ateliers ajoutés sont enregistrés dans ce navigateur.
        </p>
      </div>
    </section>
  )
}
