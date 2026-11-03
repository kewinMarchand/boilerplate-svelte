export declare namespace LegalPage {
  type Slug = 'mentions-legales' | 'donnees-personnelles' | 'accessibilite'

  interface Section {
    title: string
    /** HTML produit par l'API depuis le Markdown de l'admin, HTML saisi échappé. */
    html: string
  }

  interface Entity {
    title: string
    /** HTML placé avant la première section, vide s'il n'y en a pas. */
    introduction: string
    sections: Section[]
  }

  type Content = { status: 'success'; page: Entity } | { status: 'error'; message: string }

  type Load = Content | { status: 'not-found' }
}
