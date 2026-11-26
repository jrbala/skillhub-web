export type Niveau =
  | 'Débutant'
  | 'Débutant — bases HTML conseillées'
  | 'Tous niveaux'
  | 'Intermédiaire — JavaScript requis'
  | 'Débutant — HTML/CSS conseillés'

export interface AtelierCatalogue {
  id: string
  nom: string
  prix: number
  niveau: Niveau | 'Intermédiaire'
  duree: string
  horaires: string
  modalite: string
  code: string
  categorie: string
  description: string
  ouvert: boolean
  places: number
  formateur: string
}

// Union discriminée des quatre états de la requête du catalogue.
export type EtatRequeteAteliers =
  | { statut: 'chargement' }
  | { statut: 'erreur'; message: string }
  | { statut: 'vide' }
  | { statut: 'succes'; donnees: AtelierCatalogue[] }
