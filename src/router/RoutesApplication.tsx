import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import Accueil from '../views/Accueil'
import Catalogue from '../views/Catalogue'
import CreerAtelier from '../views/CreerAtelier'
import DetailsAtelier from '../views/DetailsAtelier'
import Compte from '../views/Compte'
import MesAteliers from '../views/MesAteliers'
import Introuvable from '../views/Introuvable'
import { useCompte } from '../hooks/useCompte'
import { estFormateur } from '../services/compte'

const Dashboard = lazy(() => import('../views/Dashboard'))

function ChargementVue() {
  return (
    <div aria-busy="true" role="status" aria-live="polite" className="mx-auto max-w-contenu px-6 py-12">
      <p className="m-0 font-bold text-accent-sombre">Chargement du tableau de bord…</p>
    </div>
  )
}

function DashboardDiffere() {
  return (
    <Suspense fallback={<ChargementVue />}>
      <Dashboard />
    </Suspense>
  )
}

function RouteProtegee() {
  const { utilisateur } = useCompte()
  const lieu = useLocation()
  return utilisateur
    ? <Outlet />
    : <Navigate to={`/connexion?retour=${encodeURIComponent(`${lieu.pathname}${lieu.search}`)}`} replace />
}

function RouteFormateur() {
  const { utilisateur } = useCompte()
  const lieu = useLocation()
  if (!utilisateur) {
    return <Navigate to={`/connexion?retour=${encodeURIComponent(`${lieu.pathname}${lieu.search}`)}`} replace />
  }
  return estFormateur(utilisateur) ? <Outlet /> : <Navigate to="/ateliers" replace />
}

function AncienneRoute({ vers }: { vers: string }) {
  const lieu = useLocation()
  return <Navigate to={`${vers}${lieu.search}${lieu.hash}`} replace />
}

export default function RoutesApplication() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Accueil />} />
        <Route path="ateliers" element={<Catalogue />} />
        <Route element={<RouteFormateur />}>
          <Route path="ateliers/nouveau" element={<CreerAtelier />} />
        </Route>
        <Route path="ateliers/:id" element={<DetailsAtelier />} />
        <Route path="connexion" element={<Compte key="connexion" />} />
        <Route path="inscription" element={<Compte key="inscription" creation />} />
        <Route element={<RouteProtegee />}>
          <Route path="profil" element={<DashboardDiffere />} />
          <Route path="dashboard" element={<DashboardDiffere />} />
          <Route path="mes-ateliers" element={<MesAteliers />} />
        </Route>
        {['index', 'connexion', 'inscription', 'profil'].map(page => (
          <Route key={page} path={`${page}.html`} element={<AncienneRoute vers={page === 'index' ? '/' : `/${page}`} />} />
        ))}
        {['html', 'css', 'javascript', 'react', 'ux', 'a11y'].map(id => (
          <Route key={id} path={`cours-${id}.html`} element={<AncienneRoute vers={`/ateliers/${id}`} />} />
        ))}
        <Route path="*" element={<Introuvable />} />
      </Route>
    </Routes>
  )
}
