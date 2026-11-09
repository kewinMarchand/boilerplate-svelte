import { z } from 'zod'

/** Schéma du formulaire, messages d'erreur dans la langue de la page. */
export const createContactSchema = (messages: Contact.ValidationMessages) =>
  z.object({
    name: z.string().trim().min(2, { error: messages.name }),
    email: z.email({ error: messages.email }),
    message: z.string().trim().min(10, { error: messages.message }),
    /** Slug du produit d'une demande de renseignement, absent pour un message de contact simple. */
    product: z.string().optional(),
  })

export declare namespace Contact {
  type FormValues = z.infer<ReturnType<typeof createContactSchema>>

  interface ValidationMessages {
    name: string
    email: string
    message: string
  }

  interface FormMessage {
    status: 'success' | 'error'
  }

  /** Produit d'une demande de renseignement, tel que le contact l'affiche. */
  interface Product {
    slug: string
    name: string
  }
}
