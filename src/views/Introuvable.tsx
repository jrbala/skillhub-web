import { Link } from 'react-router-dom'
import TitreDeVue from '../components/TitreDeVue'
export default function Introuvable() { return <div className="mx-auto max-w-contenu px-6 py-16"><TitreDeVue titreDocument="Page introuvable" className="text-3xl font-bold">Page introuvable</TitreDeVue><p className="my-5">Cette page ou cet atelier n’existe pas.</p><Link to="/ateliers" className="text-accent-sombre underline">Explorer les ateliers</Link></div> }
