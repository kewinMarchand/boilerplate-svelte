import { createContactSchema } from './contactSchema'

const MESSAGES = {
  name: 'Indiquez votre nom.',
  email: 'Indiquez une adresse e-mail valide.',
  message: 'Écrivez au moins 10 caractères.',
}
const contactSchema = createContactSchema(MESSAGES)

describe('contactSchema', () => {
  it('accepte un message complet', () => {
    const result = contactSchema.safeParse({
      name: 'Ada',
      email: 'ada@exemple.fr',
      message: 'Bonjour, ceci est un message.',
    })
    expect(result.success).toBe(true)
  })

  it('rejette un e-mail invalide avec un message explicite', () => {
    const result = contactSchema.safeParse({ name: 'Ada', email: 'ada', message: 'Bonjour à tous' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toContain('adresse e-mail valide')
  })

  it('donne les messages reçus, ceux de la langue de la page', () => {
    const result = createContactSchema({ ...MESSAGES, email: 'Enter a valid email.' }).safeParse({
      name: 'Ada',
      email: 'ada',
      message: 'Hello everyone',
    })
    expect(result.error?.issues[0]?.message).toBe('Enter a valid email.')
  })
})
