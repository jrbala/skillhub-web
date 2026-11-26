import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useCompte } from '../hooks/useCompte'
import { useInscriptions } from '../hooks/useInscriptions'
import { deconnecter, estFormateur } from '../services/compte'
import { bouton as classeBouton, secondaire } from './styles'

export default function Layout() {
  const { utilisateur, erreur } = useCompte()
  const { erreur: erreurInscriptions } = useInscriptions()
  const formateur = estFormateur(utilisateur)
  const [menu, definirMenu] = useState(false)
  const [large, definirLarge] = useState(() => window.matchMedia('(min-width: 45em)').matches)
  const [message, definirMessage] = useState('')
  const bouton = useRef<HTMLButtonElement>(null)
  const navigation = useRef<HTMLDivElement>(null)
  const lieu = useLocation()
  const naviguer = useNavigate()
  const authentification = ['/connexion', '/inscription', '/ateliers/nouveau'].includes(lieu.pathname)
  useEffect(() => {
    if (!lieu.hash) return
    const cible = document.getElementById(lieu.hash.slice(1))
    cible?.focus()
    cible?.scrollIntoView()
  }, [lieu.pathname, lieu.hash])
  useEffect(() => {
    const media = window.matchMedia('(min-width: 45em)')
    function adapter() {
      if (!media.matches && navigation.current?.contains(document.activeElement)) bouton.current?.focus()
      if (media.matches && document.activeElement === bouton.current) navigation.current?.querySelector('a')?.focus()
      definirLarge(media.matches); definirMenu(false)
    }
    media.addEventListener('change', adapter)
    return () => media.removeEventListener('change', adapter)
  }, [])
  function sortir() {
    try { deconnecter(); naviguer('/') }
    catch (cause) { definirMessage(cause instanceof Error ? cause.message : 'Déconnexion impossible.') }
  }
  const compteClasse = 'flex-1 overflow-hidden text-ellipsis whitespace-nowrap !px-2 !py-2 !text-[0.8125rem] font-bold md:flex-none md:!px-4 md:!py-[0.65rem] md:!text-[0.9375rem]'
  const lienClasse = 'inline-flex items-center border-y-[3px] border-transparent py-1 text-texte no-underline hover:border-b-accent hover:text-accent focus-visible:border-b-accent'
  return <div className={authentification ? 'flex min-h-screen flex-col' : ''}>
    <a href="#contenu" className="absolute -top-12 left-0 z-50 bg-surface px-4 py-2 focus:top-0">Aller au contenu principal</a>
    <header className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 border-b border-bordure bg-surface px-6 py-3 md:flex md:flex-wrap">
      <Link to="/" className="col-start-1 row-start-1 justify-self-start text-lg font-bold tracking-tight text-texte no-underline">SkillHub</Link>
      <nav aria-label="Menu principal" className="contents" onKeyDown={e => {
        if (e.key === 'Escape' && !large) { definirMenu(false); bouton.current?.focus() }
      }}>
        <button ref={bouton} aria-expanded={large || menu} aria-controls="navigation" onClick={() => definirMenu(!menu)} className="col-start-2 row-start-1 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-bordure bg-surface text-[1.5rem] md:hidden"><span aria-hidden="true">☰</span><span className="sr-only">Menu principal</span></button>
        <div ref={navigation} id="navigation" hidden={!large && !menu} className="col-span-full flex flex-wrap items-center gap-4 border-t border-bordure pt-3 md:flex-1 md:gap-6 md:border-0 md:pt-0" onClick={e => {
          if ((e.target as HTMLElement).closest('a, button')) { definirMenu(false); if (!large) bouton.current?.focus() }
        }}>
          <Link to="/#valeurs" className={lienClasse}>Valeurs</Link>
          <NavLink to="/ateliers" end className={lienClasse}>Ateliers</NavLink>
          {utilisateur && <NavLink to="/mes-ateliers" className={lienClasse}>Mes ateliers</NavLink>}
          {formateur && <NavLink to="/ateliers/nouveau" className={lienClasse}>Créer un atelier</NavLink>}
          <Link to="/#formateurs" className={lienClasse}>Formateurs</Link>
          <div className="flex w-full flex-wrap items-center gap-3 md:ml-auto md:w-auto">
            {utilisateur ? <><NavLink to="/profil" className={`${secondaire} ${compteClasse}`}>Mon espace</NavLink><button onClick={sortir} className={`${classeBouton} ${compteClasse}`}>Se déconnecter</button></> : <><Link to="/connexion" className={`${lienClasse} text-sm font-bold`}>Se connecter</Link><Link to="/inscription" className={`${classeBouton} ${compteClasse}`}>Créer mon compte</Link></>}
          </div>
        </div>
      </nav>
    </header>
    <main id="contenu" tabIndex={-1} className={`${authentification ? 'flex-1' : ''} ${lieu.pathname.startsWith('/ateliers/') ? 'grid grid-cols-[minmax(0,1fr)]' : ''} min-w-0 [&_p]:max-w-[65ch]`}>
      {(erreur || erreurInscriptions || message) && <p role="alert" className="mx-auto px-6 text-erreur">{erreur || erreurInscriptions || message}</p>}<Outlet />
    </main>
    <footer className="border-t border-bordure bg-surface px-6 py-4 text-center"><p className="m-0">© 2026 SkillHub. Tous droits réservés.</p></footer>
  </div>
}
