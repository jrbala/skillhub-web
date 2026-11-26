// Chargement et validation du catalogue via l'API configurée par VITE_API_URL
// (json-server en développement local, JSON statique sur le même domaine en production).
import type { AtelierCatalogue } from '../types';

export const CLE_ATELIERS_CREES = 'skillhub_ateliers_crees';
const URL_API_DEFAUT = import.meta.env.PROD ? '/api/ateliers.json' : 'http://localhost:3001';

export function construireUrlAteliers(baseApi: string | undefined = import.meta.env.VITE_API_URL): string {
  const base = (baseApi?.trim() || URL_API_DEFAUT).replace(/\/+$/, '');
  return base.endsWith('/ateliers') || base.endsWith('.json') ? base : `${base}/ateliers`;
}

function estAtelier(valeur: unknown): valeur is AtelierCatalogue {
  if (typeof valeur !== 'object' || valeur === null) return false;
  const a = valeur as Record<string, unknown>;
  const textes = ['id', 'nom', 'formateur', 'description', 'duree', 'horaires', 'modalite', 'code', 'categorie'];
  const niveaux: string[] = ['Débutant', 'Débutant — bases HTML conseillées', 'Tous niveaux', 'Intermédiaire — JavaScript requis', 'Débutant — HTML/CSS conseillés', 'Intermédiaire'];
  return textes.every(cle => typeof a[cle] === 'string' && a[cle].trim().length > 0)
    && typeof a.id === 'string' && /^[a-z0-9-]+$/.test(a.id)
    && typeof a.niveau === 'string' && niveaux.includes(a.niveau)
    && typeof a.prix === 'number' && Number.isFinite(a.prix) && a.prix >= 0
    && typeof a.places === 'number' && Number.isInteger(a.places) && a.places >= 0
    && typeof a.ouvert === 'boolean';
}

export async function chargerAteliers(
  signal: AbortSignal,
  url: string = construireUrlAteliers(),
): Promise<AtelierCatalogue[]> {
  try {
    const response: Response = await fetch(url, {
      signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Impossible de charger les ateliers (HTTP ${response.status}).`);
    const donnees: unknown = await response.json();
    if (!Array.isArray(donnees) || !donnees.every(estAtelier)
      || new Set(donnees.map(a => a.id)).size !== donnees.length) {
      throw new Error('L’API des ateliers a renvoyé des données invalides.');
    }
    return donnees;
  } catch (erreur: unknown) {
    if (signal.aborted) throw erreur;
    if (erreur instanceof TypeError) {
      throw new Error('Connexion impossible à l’API. Vérifiez que le serveur est démarré puis réessayez.', { cause: erreur });
    }
    if (erreur instanceof SyntaxError) {
      throw new Error('La réponse de l’API des ateliers est illisible.', { cause: erreur });
    }
    throw erreur;
  }
}

export function lireAteliersCrees(): AtelierCatalogue[] {
  try {
    const brut = localStorage.getItem(CLE_ATELIERS_CREES);
    if (!brut) return [];
    const donnees: unknown = JSON.parse(brut);
    if (!Array.isArray(donnees)) return [];
    const vus = new Set<string>();
    return donnees.filter((item): item is AtelierCatalogue => {
      if (!estAtelier(item) || vus.has(item.id)) return false;
      vus.add(item.id);
      return true;
    });
  } catch {
    return [];
  }
}

function genererIdentifiant(titre: string, existants: AtelierCatalogue[]): string {
  const base = titre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'atelier';
  const idsExistants = new Set([...existants.map(a => a.id), 'nouveau']);
  let candidat = base;
  let compteur = 2;
  while (idsExistants.has(candidat)) {
    candidat = `${base}-${compteur}`;
    compteur += 1;
  }
  return candidat;
}

function genererCode(titre: string): string {
  const mots = titre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(Boolean);
  if (mots.length >= 2) return mots.slice(0, 3).map(m => m[0]).join('');
  if (mots.length === 1) return mots[0].slice(0, 3);
  return 'AT';
}

export async function creerAtelier(titre: string, existants: AtelierCatalogue[]): Promise<AtelierCatalogue> {
  const nom = titre.trim();
  if (nom.length < 5) {
    throw new Error('Le titre doit contenir au moins 5 caractères.');
  }
  await new Promise(resolve => setTimeout(resolve, 150));
  const dejaCrees = lireAteliersCrees();
  const nouvelAtelier: AtelierCatalogue = {
    id: genererIdentifiant(nom, [...existants, ...dejaCrees]),
    nom,
    prix: 0,
    niveau: 'Tous niveaux',
    duree: '2 heures',
    horaires: 'À définir',
    modalite: 'À distance, en direct',
    code: genererCode(nom),
    categorie: 'Atelier communautaire',
    description: `Atelier « ${nom} » proposé sur SkillHub.`,
    ouvert: true,
    places: 10,
    formateur: 'Équipe SkillHub',
  };
  try {
    localStorage.setItem(CLE_ATELIERS_CREES, JSON.stringify([...dejaCrees, nouvelAtelier]));
  } catch (cause) {
    throw new Error('Le stockage local est indisponible ou plein. Aucun atelier enregistré.', { cause });
  }
  return nouvelAtelier;
}
