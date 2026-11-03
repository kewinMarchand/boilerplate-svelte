export declare namespace Slide {
  interface Entity {
    id: string
    imageBasePath: string
    title: string
    text: string
  }

  type Featured = { status: 'success'; slides: Entity[] } | { status: 'error'; message: string }
}
