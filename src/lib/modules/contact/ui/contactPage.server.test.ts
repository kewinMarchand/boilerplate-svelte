import { FALLBACK_IDENTITY } from '#lib/shared/config'

import { findInquiryProduct } from '../infrastructure/findInquiryProduct'
import { sendContactMessage } from '../infrastructure/sendContactMessage'
import { contactActions, loadContactPage } from './contactPage.server'

vi.mock('../infrastructure/findInquiryProduct', () => ({ findInquiryProduct: vi.fn() }))
vi.mock('../infrastructure/sendContactMessage', () => ({
  sendContactMessage: vi.fn(async () => ({ status: 'sent' })),
}))

const VALID = { name: 'Ada', email: 'ada@exemple.fr', message: 'Bonjour, ceci est un message.' }
const FR = { locale: 'fr', defaultLocale: 'fr', locales: ['fr', 'en'] }
const EN = { ...FR, locale: 'en' }

const post = (fields: Record<string, string>, locale = FR) =>
  contactActions.default({
    request: new Request('http://localhost/contact', {
      method: 'POST',
      body: new URLSearchParams(fields),
    }),
    locals: { siteIdentity: FALLBACK_IDENTITY, locale },
  })

describe('contactActions', () => {
  it('renvoie 400 et les erreurs du schéma quand le formulaire est invalide', async () => {
    const result = await post({ name: '', email: 'ada', message: '' })

    expect(result).toMatchObject({ status: 400 })
    expect(JSON.stringify(result)).toContain('adresse e-mail valide')
  })

  it('valide dans la langue de la page et envoie cette langue à l’API', async () => {
    expect(JSON.stringify(await post({ name: 'Ada', email: 'ada', message: '' }, EN))).toContain(
      'valid email address',
    )

    await post(VALID, EN)
    expect(sendContactMessage).toHaveBeenLastCalledWith(expect.objectContaining(VALID), 'en')
  })

  it('renvoie un message de succès et un formulaire vidé quand le formulaire est valide', async () => {
    const result = await post(VALID)

    expect(result).not.toHaveProperty('status')
    expect(result).toMatchObject({
      form: { valid: true, message: { status: 'success' }, data: { name: '', email: '' } },
    })
  })

  it('relaie les violations 422 de l’API sous les champs concernés', async () => {
    vi.mocked(sendContactMessage).mockResolvedValueOnce({
      status: 'invalid',
      fieldErrors: [{ field: 'name', message: 'Votre nom ne doit pas dépasser 255 caractères.' }],
    })

    const result = await post(VALID)

    expect(result).toMatchObject({
      status: 422,
      data: { form: { errors: { name: ['Votre nom ne doit pas dépasser 255 caractères.'] } } },
    })
  })
})

describe('loadContactPage', () => {
  const MONSTERA = { slug: 'monstera-deliciosa', name: 'Monstera deliciosa' }

  it('prépare une demande de renseignement sur le produit de l’URL', async () => {
    vi.mocked(findInquiryProduct).mockResolvedValueOnce(MONSTERA)

    const page = await loadContactPage(
      new URL('http://localhost/contact?produit=monstera-deliciosa'),
      FR,
    )

    expect(findInquiryProduct).toHaveBeenLastCalledWith('monstera-deliciosa')
    expect(page.product).toEqual(MONSTERA)
    expect(page.form.data.product).toBe('monstera-deliciosa')
    expect(page.form.errors).toEqual({})
  })

  it.each([
    ['inconnu de l’API', () => vi.mocked(findInquiryProduct).mockResolvedValueOnce(null)],
    [
      'API en erreur',
      () => vi.mocked(findInquiryProduct).mockRejectedValueOnce(new Error('panne')),
    ],
  ])('retombe sur un message simple, produit %s', async (_, arrange) => {
    arrange()

    const page = await loadContactPage(new URL('http://localhost/contact?produit=inconnu'), FR)

    expect(page.product).toBeNull()
    expect(page.form.data.product).toBeUndefined()
  })

  it('n’interroge pas l’API sans produit dans l’URL', async () => {
    vi.mocked(findInquiryProduct).mockClear()

    expect((await loadContactPage(new URL('http://localhost/contact'), FR)).product).toBeNull()
    expect(findInquiryProduct).not.toHaveBeenCalled()
  })
})
