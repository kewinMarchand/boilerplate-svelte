<script lang="ts">
  import { useDictionary } from '#lib/shared/i18n'
  import { resolveHref } from '#lib/shared/routing'
  import { PageHeader } from '#lib/shared/ui/layout'

  import ContactForm from './ContactForm.svelte'

  import type { Contact } from '../domain/contactSchema'
  import type { SuperValidated } from 'sveltekit-superforms'

  interface Props {
    form: SuperValidated<Contact.FormValues, Contact.FormMessage>
    /** Produit d'une demande de renseignement (`?produit=<slug>`), `null` pour un message simple. */
    product: Contact.Product | null
  }

  const { form, product }: Props = $props()
  const t = useDictionary()
</script>

<PageHeader title={t.contact.title} description={t.contact.description} />

<p class="lead">{t.contact.intro}</p>
{#if product}
  <p class="mb-6" data-testid="contact-product">
    {t.contact.product}
    <a href={resolveHref(`/produit/${product.slug}`)} class="bui-link">{product.name}</a>
  </p>
{/if}
<ContactForm data={form} {product} />
