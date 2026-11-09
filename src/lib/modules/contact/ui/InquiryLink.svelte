<script lang="ts">
  import { format, useDictionary } from '#lib/shared/i18n'
  import { resolveHref } from '#lib/shared/routing'
  import { Button } from '#lib/shared/ui/kit'

  import { inquiryHref } from './inquiry'

  interface Props {
    slug: string
    name: string
  }

  const { slug, name }: Props = $props()
  const t = useDictionary()
</script>

<!-- Présent sans JavaScript et même en rupture de stock : la demande passe par la page de contact. -->
<div class="mb-6">
  <Button href={resolveHref(inquiryHref(slug))} icon="mail" data-testid="product-inquiry">
    {t.contact.inquiry}<span class="bui-visually-hidden"
      >{format(t.contact.inquiryAbout, { name })}</span
    >
  </Button>
</div>
