import { superForm } from 'sveltekit-superforms'
import { zod4Client } from 'sveltekit-superforms/adapters'

import { createContactSchema } from '#lib/modules/contact/domain/contactSchema'

import type { Contact } from '#lib/modules/contact/domain/contactSchema'
import type { SuperValidated } from 'sveltekit-superforms'

export const useContactForm = (
  initial: SuperValidated<Contact.FormValues, Contact.FormMessage>,
  messages: Contact.ValidationMessages,
) =>
  superForm(initial, {
    validators: zod4Client(createContactSchema(messages)),
    validationMethod: 'onblur',
  })
