# SkillHub

[Voir la démonstration en ligne](https://skillhub.ademilsonferreira.com) · [Portfolio développeur](https://dev.ademilsonferreira.com)

Projet de formation — développement web full stack, IMIE Paris.

Application web front-end de découverte, recherche, inscription et gestion d’ateliers de compétences, développée avec **React 19**, **TypeScript**, **Vite 8**, **React Router 7** et **Tailwind CSS 4**.

L’application met l’accent sur une architecture front-end claire (séparation vues / composants / contextes / hooks / services), un typage TypeScript strict, une gestion explicite des états asynchrones et l’accessibilité (navigation au clavier, gestion du focus en SPA, modales natives `<dialog>`, annonces `aria-live`, conception responsive mobile-first).

---

## Stack technique

- **Interface & rendu** : React 19, TypeScript
- **Build & serveur de développement** : Vite 8
- **Routage côté client** : React Router 7 (routes publiques, routes protégées par session et par rôle, chargement différé du tableau de bord via `React.lazy` + `Suspense`)
- **Styles** : Tailwind CSS 4 + jetons CSS personnalisés (`src/jetons.css`, `tailwind.config.js`) et police locale Inter (`woff2`)
- **API locale de démonstration** : `json-server` servant le catalogue `db.json`
- **Qualité** : ESLint (`eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `typescript-eslint`) et compilation stricte TypeScript (`tsc -b`)

---

## Fonctionnalités existantes

- **Accueil (`/`)** : présentation de la plateforme, mise en avant du prochain atelier avec fenêtre de réservation (`<dialog>`), valeurs, carrousel d’ateliers, présentation des formateurs et formulaire de contact de démonstration.
- **Catalogue filtrable (`/ateliers`)** :
  - Recherche par mot-clé (titre, description ou formateur) avec champ `combobox` accessible et suggestions navigables au clavier.
  - Filtrage par niveau, filtre « Places disponibles uniquement » et tri par prix croissant ou décroissant.
  - Synchronisation des filtres dans l’URL via `useSearchParams` (`q`, `niveau`, `tri`, `disponible=1`).
  - Gestion typée des 4 états asynchrones (`chargement`, `erreur` avec bouton *Réessayer*, `vide`, `succes`) et annulation des requêtes obsolètes via `AbortController`.
  - Aperçu rapide de chaque atelier en modale `<dialog>` et inscription directe depuis la carte.
- **Fiche détaillée (`/ateliers/:id`)** : objectifs pédagogiques et programme détaillé (pour les 6 ateliers disposant d’un programme complet), informations pratiques, formateur et réservation.
- **Compte local et rôles (`/inscription`, `/connexion`)** :
  - Création de compte et connexion en mode démonstration locale, avec choix du profil **Apprenant** ou **Formateur**.
  - Conservation du parcours de retour (`?atelier=` / `?retour=`) après authentification.
- **Espace personnel (`/profil`, `/dashboard`, `/mes-ateliers`)** :
  - Tableau de bord chargé à la demande (`React.lazy` + `Suspense`) : informations du compte, nombre d’inscriptions, ateliers suivis, places restantes et désinscription confirmée par `<dialog>`.
  - Vue « Mes ateliers » affichant les ateliers suivis ainsi que, pour un profil formateur, les ateliers créés localement.
- **Création d’atelier (`/ateliers/nouveau`)** : route réservée au profil **Formateur** (`RouteFormateur`), formulaire contrôlé avec validation accessible, ajout immédiat au catalogue local et génération de la fiche détaillée.
- **Page 404 (`*`)** et redirections de compatibilité (`*.html`).

---

## Architecture du projet

```text
skillhub-web/
├── db.json                        # Catalogue de 12 ateliers servi par json-server en local
├── .env.example                   # Exemple de configuration locale (VITE_API_URL)
├── .env.production                # URL de l’API statique en production (/api/ateliers.json)
├── vercel.json                    # Configuration Vercel (JSON statique + fallback SPA)
├── index.html
├── public/
│   ├── api/
│   │   └── ateliers.json          # Catalogue statique des 12 ateliers pour la production
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── App.tsx                    # BrowserRouter + fournisseurs de contexte + routeur
│   ├── main.tsx                   # Point d’entrée React (StrictMode)
│   ├── types.ts                   # Types métier et union discriminée EtatRequeteAteliers
│   ├── index.css / jetons.css     # Entrée Tailwind CSS 4, polices locales et variables CSS
│   ├── assets/                    # Polices Inter (.woff2), images (.webp) et icônes SVG
│   ├── router/
│   │   └── RoutesApplication.tsx  # Déclaration des routes, gardes et lazy-loading
│   ├── views/                     # Une vue par route
│   ├── components/                # Composants réutilisables (Layout, CarteAtelier, etc.)
│   ├── context/                   # Fournisseurs de contexte (Ateliers, Compte, Inscriptions)
│   ├── hooks/                     # Hooks personnalisés (useAteliers, useCompte, useInscriptions, useInscription)
│   └── services/                  # Accès API (fetch + validation), stockage local et programmes
└── tests/
    ├── react-parcours.mjs         # Test navigateur E2E du parcours utilisateur complet
    └── react-erreurs.mjs          # Test navigateur E2E clavier, focus, erreurs API et stockage
```

---

## Installation et exécution

### Prérequis

- **Node.js** (version 20 ou supérieure recommandée)
- **npm**

### 1. Installer les dépendances

```sh
npm install
```

### 2. Configuration (optionnelle)

Par défaut, l’application interroge `http://localhost:3001`. Pour personnaliser l’URL de l’API, créez un fichier `.env.local` à partir de `.env.example` :

```sh
cp .env.example .env.local
```

```env
VITE_API_URL=http://localhost:3001
```

### 3. Lancer l’API locale et l’application

L’application nécessite l’API locale `json-server` pour charger le catalogue des ateliers.

**Terminal 1 — Démarrer l’API locale (`json-server`) :**

```sh
npm run api
```

Expose le catalogue sur `http://localhost:3001/ateliers`.

**Terminal 2 — Démarrer le serveur de développement Vite :**

```sh
npm run dev
```

L’application est ensuite accessible à l’adresse indiquée par Vite (par défaut `http://localhost:5173`).

---

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run api` | Démarre l’API locale `json-server` sur le port `3001` à partir de `db.json` |
| `npm run dev` | Démarre le serveur de développement Vite |
| `npm run lint` | Lance la vérification ESLint sur le projet |
| `npm run build` | Vérifie le typage TypeScript (`tsc -b`) et génère le build de production dans `dist/` |
| `npm run preview` | Sert localement le build de production (utilise le JSON statique `/api/ateliers.json` sur le même domaine) |

### Tester les rôles en local

- **Profil Apprenant** : créez un compte sur `/inscription` avec le profil par défaut *Apprenant (élève)* puis connectez-vous. L’accès à `/ateliers/nouveau` redirige vers `/ateliers`.
- **Profil Formateur** : créez un compte sur `/inscription` en sélectionnant *Formateur* puis connectez-vous. Le lien *Créer un atelier* apparaît dans la navigation et `/ateliers/nouveau` devient accessible.

### Tests automatisés navigateur (E2E)

Le dossier `tests/` contient deux scripts Node.js utilisant le protocole Chrome DevTools (CDP) pour vérifier le parcours complet, la navigation clavier, le focus, les erreurs réseau/JSON et le responsive (`tests/react-parcours.mjs` et `tests/react-erreurs.mjs`). Ils s’exécutent contre une instance locale de l’API (`npm run api`), du build servi (`npm run preview`) et de Chrome lancé avec `--remote-debugging-port` sur un profil temporaire.

---

## Limites connues et périmètre

- **Catalogue statique en production / API locale en développement** : en développement local (`npm run dev`), le catalogue est chargé depuis `http://localhost:3001/ateliers` (`json-server` + `db.json`). En production (`npm run build` / Vercel), le catalogue est servi depuis le même domaine via le fichier statique `/api/ateliers.json` (`.env.production` + `vercel.json`).
- **Stockage de démonstration côté navigateur** : les comptes utilisateurs (mot de passe haché en SHA-256 via `crypto.subtle`), la session active, les inscriptions et les ateliers créés par un formateur sont enregistrés uniquement dans `localStorage` (`skillhub_utilisateurs`, `skillhub_session`, `skillhub_inscriptions`, `skillhub_ateliers_crees`). Il ne s’agit pas d’une authentification ni d’une persistance serveur de production — utilisez uniquement des données fictives.
- **Formulaire de contact et réservations** : le formulaire de contact de la page d’accueil valide les champs côté client sans envoyer d’e-mail, et les réservations d’ateliers n’impliquent aucun paiement réel.
- **Déploiement statique Vercel** : le fichier `vercel.json` configure la publication front-end (build Vite dans `dist/`, JSON statique sous `/api/ateliers.json` et `/api/ateliers`, et réécriture des routes React Router vers `/index.html`).
