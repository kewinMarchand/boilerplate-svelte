import { render, screen } from '@testing-library/svelte'
import { superValidate } from 'sveltekit-superforms'
import { zod4 } from 'sveltekit-superforms/adapters'

import { fr } from '#lib/shared/i18n/dictionaries/fr'

import { createContactSchema } from '../domain/contactSchema'
import ContactForm from './ContactForm.svelte'

import type { Contact } from '../domain/contactSchema'

const contactSchema = createContactSchema(fr.contact.validation)

describe('ContactForm', () => {
  it('lie le message d’erreur au champ invalide', async () => {
    const data = await superValidate<Contact.FormValues, Contact.FormMessage>(
      { name: 'Ada', email: 'ada', message: 'Bonjour à tous' },
      zod4(contactSchema),
    )
    render(ContactForm, { data, product: null })

    const email = screen.getByTestId('contact-email')
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(email).toHaveAccessibleDescription(/adresse e-mail valide/)
    expect(screen.getByTestId('contact-name')).not.toHaveAttribute('aria-invalid')
  })

  it('confirme l’envoi quand le serveur renvoie un succès', async () => {
    const data = await superValidate<Contact.FormValues, Contact.FormMessage>(zod4(contactSchema))
    data.message = { status: 'success' }
    render(ContactForm, { data, product: null })

    expect(screen.getByTestId('contact-success')).toBeInTheDocument()
    expect(screen.queryByTestId('contact-error')).not.toBeInTheDocument()
  })

  it('envoie le produit d’une demande de renseignement et adapte la confirmation', async () => {
    const data = await superValidate<Contact.FormValues, Contact.FormMessage>(zod4(contactSchema))
    data.message = { status: 'success' }
    const { container } = render(ContactForm, {
      data,
      product: { slug: 'monstera-deliciosa', name: 'Monstera deliciosa' },
    })

    expect(container.querySelector('input[type="hidden"][name="product"]')).toHaveValue(
      'monstera-deliciosa',
    )
    expect(screen.getByTestId('contact-success')).toHaveTextContent(
      'Votre demande de renseignement a bien été envoyée.',
    )
  })
})
