<script lang="ts">
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
</script>

<PageHeader
  title="Contact"
  description="Démo de formulaire : validation par schéma zod avec superforms, erreurs liées aux champs, envoi par action serveur avec amélioration progressive."
/>

<p class="lead">
  Formulaire validé par un schéma zod, envoyé par une action serveur. Il fonctionne aussi sans
  JavaScript.
</p>
{#if product}
  <p class="mb-6" data-testid="contact-product">
    Votre demande concerne :
    <a href={resolveHref(`/produit/${product.slug}`)} class="bui-link">{product.name}</a>
  </p>
{/if}
<ContactForm data={form} {product} />
