<script lang="ts">
  import { languageName, useDictionary, useLocale, usePageAlternates } from '#lib/shared/i18n'
  import { resolveHref } from '#lib/shared/routing'

  const t = useDictionary()
  const locale = useLocale()

  // La page dans chaque langue, sinon l'accueil de cette langue (page détaillée sans équivalent, erreur)
  const links = $derived.by(() => {
    const alternates = usePageAlternates()
    return locale.locales.map((code) => ({
      code,
      href: resolveHref(
        alternates.find((alternate) => alternate.locale === code)?.path ?? '/',
        code,
      ),
    }))
  })
</script>

<!--
  Absent sur un site monolingue. Changer de langue recharge la page (`data-sveltekit-reload`) : langue,
  libellés et données valent pour tout le document. Liens simples, utilisables sans JavaScript.
-->
{#if locale.locales.length > 1}
  <nav
    aria-label={t.layout.languages}
    class="container-page languages"
    data-ui-chrome
    data-testid="layout-languages"
  >
    <ul class="languages-list">
      {#each links as link (link.code)}
        <li>
          <a
            href={link.href}
            lang={link.code}
            hreflang={link.code}
            aria-current={link.code === locale.locale ? 'true' : undefined}
            class="languages-link"
            data-sveltekit-reload
            data-testid="layout-language-{link.code}">{languageName(link.code)}</a
          >
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style>
  /* Bande au-dessus de la barre d'en-tête, alignée à droite, sur le fond de l'en-tête */
  .languages {
    display: flex;
    justify-content: flex-end;
  }

  .languages-list {
    display: flex;
    gap: var(--bui-space-1);
  }

  .languages-link {
    display: inline-flex;
    align-items: center;
    min-height: var(--bui-size-touch);
    padding-inline: var(--bui-space-2);
    border-radius: var(--bui-radius-md);
    color: inherit;
    font-size: var(--bui-font-size-body-sm);
    text-decoration: none;
  }

  .languages-link:hover,
  .languages-link[aria-current='true'] {
    text-decoration: underline;
  }

  .languages-link[aria-current='true'] {
    font-weight: var(--bui-font-weight-bold);
  }

  .languages-link:focus-visible {
    outline: 2px solid currentcolor;
    outline-offset: 2px;
  }
</style>
