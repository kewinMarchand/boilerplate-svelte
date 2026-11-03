<script lang="ts">
  import { ImageCarousel } from '#lib/shared/ui/carousel'
  import { Alert } from '#lib/shared/ui/kit'

  import type { Slide } from '../domain/slide'

  interface Props {
    slides: Slide.Featured
  }

  const { slides }: Props = $props()

  const titleId = $props.id()
</script>

{#if slides.status === 'error'}
  <Alert variant="error" data-testid="home-carousel-error">{slides.message}</Alert>
{:else if slides.slides.length}
  <section aria-labelledby={titleId} data-testid="home-carousel">
    <h2 id={titleId} class="section-title">À la une</h2>
    <ImageCarousel slides={slides.slides} label="À la une" />
  </section>
{/if}
