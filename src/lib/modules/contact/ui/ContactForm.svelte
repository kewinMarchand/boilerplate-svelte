<script lang="ts">
  import { Alert, Button, TextField } from '#lib/shared/ui/kit'

  import { useContactForm } from './hooks/useContactForm.svelte'

  import type { Contact } from '../domain/contactSchema'
  import type { SuperValidated } from 'sveltekit-superforms'

  interface Props {
    data: SuperValidated<Contact.FormValues, Contact.FormMessage>
    product: Contact.Product | null
  }

  const { data, product }: Props = $props()

  // svelte-ignore state_referenced_locally
  const { form, errors, message, submitting, enhance } = useContactForm(data)
</script>

<form method="POST" novalidate class="flex max-w-form flex-col gap-4" use:enhance>
  {#if product}
    <input type="hidden" name="product" value={product.slug} />
  {/if}
  <TextField
    name="name"
    label="Nom"
    autocomplete="name"
    required
    errors={$errors.name}
    data-testid="contact-name"
    bind:value={$form.name}
  />
  <TextField
    name="email"
    label="E-mail"
    type="email"
    autocomplete="email"
    required
    errors={$errors.email}
    data-testid="contact-email"
    bind:value={$form.email}
  />
  <TextField
    name="message"
    label="Message"
    multiline
    required
    errors={$errors.message}
    data-testid="contact-message"
    bind:value={$form.message}
  />
  <Button type="submit" icon="mail" loading={$submitting} data-testid="contact-submit">
    Envoyer
  </Button>
  <div aria-live="polite">
    {#if $message?.status === 'success'}
      <Alert variant="success" data-testid="contact-success">
        {product
          ? 'Votre demande de renseignement a bien été envoyée.'
          : 'Merci, votre message a bien été envoyé.'}
      </Alert>
    {:else if $errors.product}
      <Alert variant="error">{$errors.product[0]}</Alert>
    {:else if $message?.status === 'error'}
      <Alert variant="error" data-testid="contact-error">
        L'envoi a échoué. Réessayez dans quelques instants.
      </Alert>
    {/if}
  </div>
</form>
