import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().trim().min(2, { error: 'Indiquez votre nom (2 caractères minimum).' }),
  email: z.email({ error: 'Indiquez une adresse e-mail valide, par exemple nom@domaine.fr.' }),
  message: z
    .string()
    .trim()
    .min(10, { error: 'Votre message doit contenir au moins 10 caractères.' }),
  /** Slug du produit d'une demande de renseignement, absent pour un message de contact simple. */
  product: z.string().optional(),
})

export declare namespace Contact {
  type FormValues = z.infer<typeof contactSchema>

  interface FormMessage {
    status: 'success' | 'error'
  }

  /** Produit d'une demande de renseignement, tel que le contact l'affiche. */
  interface Product {
    slug: string
    name: string
  }
}
