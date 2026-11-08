import type { Contact } from '#lib/modules/contact/domain/contactSchema'
import type { components } from '#lib/shared/api/client'

type ApiErrorDto = components['schemas']['ConstraintViolation'] | components['schemas']['Error']
type ProductDetailDto = components['schemas']['ProductDetail']

export interface FieldError {
  field: keyof Contact.FormValues
  message: string
}

const FIELDS: (keyof Contact.FormValues)[] = ['name', 'email', 'message', 'product']

const isField = (path: string): path is keyof Contact.FormValues =>
  FIELDS.some((field) => field === path)

/** Violations 422 vers les erreurs de champ. Les messages de l'API sont déjà en français. */
export const toFieldErrors = (dto: ApiErrorDto | undefined): FieldError[] =>
  (dto && 'violations' in dto ? (dto.violations ?? []) : []).flatMap(({ propertyPath, message }) =>
    isField(propertyPath) ? [{ field: propertyPath, message }] : [],
  )

export const toInquiryProduct = (dto: ProductDetailDto): Contact.Product => ({
  slug: dto.slug,
  name: dto.name,
})
