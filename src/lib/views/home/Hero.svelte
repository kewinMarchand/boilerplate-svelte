<script lang="ts">
  import { useDictionary } from '#lib/shared/i18n'
  import { resolveHref } from '#lib/shared/routing'
  import { Button, ResponsiveImage, staticImage } from '#lib/shared/ui/kit'

  interface Props {
    name: string
    tagline: string
  }

  const { name, tagline }: Props = $props()
  const t = useDictionary()

  const HERO = staticImage('/images/hero', [640, 960, 1280, 1920], {
    width: 1920,
    height: 1080,
    alt: '',
  })
</script>

<div class="hero full-bleed" data-testid="home-hero">
  <ResponsiveImage image={HERO} sizes="100vw" priority class="hero-media" />
  <div class="hero-overlay"></div>
  <div class="container-page py-12">
    <div class="max-w-prose">
      <p class="hero-overline">{t.home.overline}</p>
      <h1 class="heading-1">{name}</h1>
      <p class="mb-8 text-title">{tagline}</p>
      <div class="flex flex-col gap-4 sm:flex-row">
        <Button href={resolveHref('/taches')} variant="light" data-testid="home-tasks-link">
          {t.home.tasksLink}
        </Button>
        <Button
          href={resolveHref('/contact')}
          variant="outline-light"
          data-testid="home-contact-link"
        >
          {t.home.contactLink}
        </Button>
      </div>
    </div>
  </div>
</div>
