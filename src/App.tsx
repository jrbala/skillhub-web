import { BrowserRouter } from 'react-router-dom'
import FournisseurCompte from './context/FournisseurCompte'
import FournisseurInscriptions from './context/FournisseurInscriptions'
import FournisseurAteliers from './context/FournisseurAteliers'
import RoutesApplication from './router/RoutesApplication'
export default function App() {
  return <BrowserRouter><FournisseurCompte><FournisseurInscriptions><FournisseurAteliers><RoutesApplication /></FournisseurAteliers></FournisseurInscriptions></FournisseurCompte></BrowserRouter>
}
