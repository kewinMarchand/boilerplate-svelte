import { fail, message, setError, superValidate } from 'sveltekit-superforms'
import { zod4 } from 'sveltekit-superforms/adapters'

import { dictionaryFor } from '#lib/shared/i18n/index.server'

import { createContactSchema } from '../domain/contactSchema'
import { findInquiryProduct } from '../infrastructure/findInquiryProduct'
import { sendContactMessage } from '../infrastructure/sendContactMessage'
import { INQUIRY_PARAM } from './inquiry'

import type { Contact } from '../domain/contactSchema'
import type { LocaleContext } from '#lib/shared/i18n'

/** Schéma aux messages de la langue de la page. */
const contactAdapter = (locale: LocaleContext) =>
  zod4(createContactSchema(dictionaryFor(locale).contact.validation))

const EMPTY_VALUES: Contact.FormValues = { name: '', email: '', message: '' }

/** Produit de `?produit=<slug>` ; slug inconnu ou API en erreur : formulaire de contact simple. */
const loadInquiryProduct = async (url: URL): Promise<Contact.Product | null> => {
  const slug = url.searchParams.get(INQUIRY_PARAM)
  if (!slug) return null
  return findInquiryProduct(slug).catch(() => null)
}

export const loadContactPage = async (url: URL, locale: LocaleContext) => {
  const product = await loadInquiryProduct(url)
  const form = product
    ? await superValidate<Contact.FormValues, Contact.FormMessage>(
        { product: product.slug },
        contactAdapter(locale),
        { errors: false },
      )
    : await superValidate<Contact.FormValues, Contact.FormMessage>(contactAdapter(locale))
  return { form, product }
}

export const contactActions = {
  default: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
    const form = await superValidate<Contact.FormValues, Contact.FormMessage>(
      request,
      contactAdapter(locals.locale),
    )

    if (!form.valid) {
      return fail(400, { form })
    }

    let result
    try {
      result = await sendContactMessage(form.data, locals.locale.locale)
    } catch {
      return message(form, { status: 'error' }, { status: 500 })
    }

    if (result.status === 'invalid') {
      for (const { field, message: error } of result.fieldErrors) setError(form, field, error)
      return fail(422, { form })
    }

    form.data = { ...EMPTY_VALUES, ...(form.data.product && { product: form.data.product }) }
    return message(form, { status: 'success' })
  },
}
