<script lang="ts">
  import { useDictionary } from '#lib/shared/i18n'
  import { Alert, Button, TextField } from '#lib/shared/ui/kit'

  import { useContactForm } from './hooks/useContactForm.svelte'

  import type { Contact } from '../domain/contactSchema'
  import type { SuperValidated } from 'sveltekit-superforms'

  interface Props {
    data: SuperValidated<Contact.FormValues, Contact.FormMessage>
    product: Contact.Product | null
  }

  const { data, product }: Props = $props()

  const t = useDictionary()
  // svelte-ignore state_referenced_locally
  const { form, errors, message, submitting, enhance } = useContactForm(data, t.contact.validation)
</script>

<form method="POST" novalidate class="flex max-w-form flex-col gap-4" use:enhance>
  {#if product}
    <input type="hidden" name="product" value={product.slug} />
  {/if}
  <TextField
    name="name"
    label={t.contact.name}
    autocomplete="name"
    required
    requiredLabel={t.ui.required}
    errors={$errors.name}
    data-testid="contact-name"
    bind:value={$form.name}
  />
  <TextField
    name="email"
    label={t.contact.email}
    type="email"
    autocomplete="email"
    required
    requiredLabel={t.ui.required}
    errors={$errors.email}
    data-testid="contact-email"
    bind:value={$form.email}
  />
  <TextField
    name="message"
    label={t.contact.message}
    multiline
    required
    requiredLabel={t.ui.required}
    errors={$errors.message}
    data-testid="contact-message"
    bind:value={$form.message}
  />
  <Button
    type="submit"
    icon="mail"
    loading={$submitting}
    loadingLabel={t.ui.loading}
    data-testid="contact-submit"
  >
    {t.contact.send}
  </Button>
  <div aria-live="polite">
    {#if $message?.status === 'success'}
      <Alert variant="success" prefix={t.ui.alert.success} data-testid="contact-success">
        {product ? t.contact.inquirySent : t.contact.sent}
      </Alert>
    {:else if $errors.product}
      <Alert variant="error" prefix={t.ui.alert.error}>{$errors.product[0]}</Alert>
    {:else if $message?.status === 'error'}
      <Alert variant="error" prefix={t.ui.alert.error} data-testid="contact-error"
        >{t.contact.sendError}</Alert
      >
    {/if}
  </div>
</form>
