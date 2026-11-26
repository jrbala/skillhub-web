import { section, champ, etiquetteChamp, bouton } from './styles'
import { useRef, useState, type FormEvent } from 'react'

const erreurChamp = 'mt-2 mb-0 text-sm text-erreur empty:hidden'

export default function Contact() {
  const [message, definirMessage] = useState('')
  const [erreurs, definirErreurs] = useState<Record<string, string>>({})
  const statut = useRef<HTMLParagraphElement>(null)
  function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const champs = Array.from(e.currentTarget.querySelectorAll('input, textarea')) as (HTMLInputElement | HTMLTextAreaElement)[]
    const fautes = Object.fromEntries(champs.filter(c => !c.value.trim() || !c.checkValidity()).map(c => [c.name, c.name === 'email' ? 'Veuillez saisir une adresse e-mail valide.' : 'Veuillez remplir ce champ.']))
    definirErreurs(fautes)
    if (Object.keys(fautes).length) { champs.find(c => fautes[c.name])?.focus(); return }
    definirMessage('Votre demande de démonstration a été validée. Aucune donnée n’a été envoyée ni inscription à un atelier effectuée.')
    statut.current?.focus()
  }
  return <section id="inscription" className={section}>
    <div className="grid gap-6 border-t border-bordure pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)] md:gap-10 md:pt-10">
      <div>
        <h2 id="titre-contact" className="m-0 text-3xl leading-tight tracking-tight">Contactez SkillHub</h2>
        <p className="mt-3 mb-0 text-[#53576a]">Vous pouvez essayer ce formulaire de démonstration. Pour réserver un atelier, utilisez le bouton « S’inscrire » sur sa fiche.</p>
      </div>
      <form noValidate onSubmit={envoyer} aria-labelledby="titre-contact" className="grid gap-5 rounded-carte border border-bordure bg-surface p-5 shadow-carte md:grid-cols-2 md:p-7">
        {[{ nom: 'nom', label: 'Nom', type: 'text', autocomplete: 'name' }, { nom: 'email', label: 'Adresse e-mail', type: 'email', autocomplete: 'email' }].map(c => <div key={c.nom} className="min-w-0">
          <label className={etiquetteChamp} htmlFor={`contact-${c.nom}`}>{c.label}</label>
          <input id={`contact-${c.nom}`} required name={c.nom} type={c.type} autoComplete={c.autocomplete} aria-invalid={Boolean(erreurs[c.nom])} aria-describedby={`contact-erreur-${c.nom}`} className={champ} />
          <p id={`contact-erreur-${c.nom}`} className={erreurChamp}>{erreurs[c.nom]}</p>
        </div>)}
        <div className="col-span-full">
          <label className={etiquetteChamp} htmlFor="contact-message">Message</label>
          <textarea rows={4} id="contact-message" required name="message" aria-invalid={Boolean(erreurs.message)} aria-describedby="contact-erreur-message" className={`${champ} block resize-y`} />
          <p id="contact-erreur-message" className={erreurChamp}>{erreurs.message}</p>
        </div>
        <div className="col-span-full">
          <button type="submit" className={`${bouton} font-bold`}>Envoyer ma demande</button>
          <p ref={statut} tabIndex={-1} role="status" className="m-0 rounded-lg text-sm font-bold text-accent-sombre not-empty:mt-4 not-empty:bg-lavande not-empty:p-3">{message}</p>
        </div>
      </form>
    </div>
  </section>
}
