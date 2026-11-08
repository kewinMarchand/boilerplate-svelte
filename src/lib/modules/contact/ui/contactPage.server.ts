import { fail, message, setError, superValidate } from 'sveltekit-superforms'
import { zod4 } from 'sveltekit-superforms/adapters'

import { contactSchema } from '../domain/contactSchema'
import { findInquiryProduct } from '../infrastructure/findInquiryProduct'
import { sendContactMessage } from '../infrastructure/sendContactMessage'
import { INQUIRY_PARAM } from './inquiry'

import type { Contact } from '../domain/contactSchema'

const contactAdapter = zod4(contactSchema)

const EMPTY_VALUES: Contact.FormValues = { name: '', email: '', message: '' }

/** Produit de `?produit=<slug>` ; slug inconnu ou API en erreur : formulaire de contact simple. */
const loadInquiryProduct = async (url: URL): Promise<Contact.Product | null> => {
  const slug = url.searchParams.get(INQUIRY_PARAM)
  if (!slug) return null
  return findInquiryProduct(slug).catch(() => null)
}

export const loadContactPage = async (url: URL) => {
  const product = await loadInquiryProduct(url)
  const form = product
    ? await superValidate<Contact.FormValues, Contact.FormMessage>(
        { product: product.slug },
        contactAdapter,
        { errors: false },
      )
    : await superValidate<Contact.FormValues, Contact.FormMessage>(contactAdapter)
  return { form, product }
}

export const contactActions = {
  default: async ({ request }: { request: Request }) => {
    const form = await superValidate<Contact.FormValues, Contact.FormMessage>(
      request,
      contactAdapter,
    )

    if (!form.valid) {
      return fail(400, { form })
    }

    let result
    try {
      result = await sendContactMessage(form.data)
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
