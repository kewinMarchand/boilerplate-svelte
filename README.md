# boilerplate-svelte

Point de départ pour une application **SvelteKit 3** (Svelte 5, runes) avec **Tailwind CSS 4**, **TanStack Query**, **superforms + zod**, et toute la chaîne qualité : lint, format, types, tests unitaires, end-to-end, accessibilité et Lighthouse.

Les pages de démonstration montrent chaque brique en situation :

| Page                                 | Ce qu'elle montre                                                                                                                      |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                  | Hero plein écran (image LCP préchargée), carrousel Embla lu dans l'API, articles rendus côté serveur avec leurs trois états            |
| `/taches`                            | Chargement côté client avec TanStack Query : chargement, erreur avec relance, liste vide                                               |
| `/contact`                           | Formulaire superforms + zod, action serveur, erreurs liées aux champs, fonctionne sans JavaScript                                      |
| `/catalogue/...`                     | Catalogue à facettes : état dans l'URL, comptage disjonctif, tri, pagination, vue grille ou liste, formulaire GET sans JS              |
| Pages légales                        | Mentions légales, données personnelles, déclaration d'accessibilité lues dans l'API (texte administré dans son `/admin`), plan du site |
| `/charte-graphique` (dev uniquement) | Tokens, typographie, composants et états, avec ratios de contraste calculés                                                            |

S'y ajoutent : menu de catégories en cascade (desktop) et en niveaux (mobile), fil d'Ariane et JSON-LD, métadonnées SEO rendues côté serveur, mode accessibilité renforcée, pages d'erreur 404, 500 et 503.

## Stack

| Brique                                  | Rôle                                                                         |
| --------------------------------------- | ---------------------------------------------------------------------------- |
| SvelteKit 3, adapter-node               | Routage, rendu serveur, form actions, endpoints `robots.txt` et sitemap      |
| Svelte 5 (runes), TypeScript 6 (strict) | UI et typage                                                                 |
| Tailwind CSS 4                          | Styles, sur les tokens de boilerplates-ui (`src/lib/shared/theme/theme.css`) |
| boilerplates-ui                         | Tokens, CSS des composants et comportement natif communs aux boilerplates    |
| TanStack Svelte Query 6                 | Cache et synchronisation des données côté client                             |
| sveltekit-superforms 3 + zod 4          | Formulaires validés côté serveur et client, même schéma                      |
| Embla Carousel 8                        | Carrousel (glisser, swipe, molette), via `shared/ui/carousel`                |
| Lucide (sprite SVG)                     | Icônes : `static/icons.svg` généré par `make icons`, composant `Icon`        |
| @fontsource-variable/inter              | Police Inter servie localement                                               |
| ESLint 10, Prettier, Husky, lint-staged | Qualité du code et règles d’architecture, vérifiées à chaque commit          |
| Vitest 5 + Testing Library              | Tests unitaires et fonctionnels                                              |
| Playwright + axe-core                   | Tests end-to-end et accessibilité, desktop et mobile, deux modes             |
| Lighthouse CI                           | Performance, accessibilité, SEO, bonnes pratiques                            |

## Prérequis

- Docker avec Compose
- `make`
- git

Rien d'autre : ni Node, ni Yarn, ni navigateur sur la machine. Chaque commande `make` lance `docker compose run` sur le service `node` (image officielle Playwright, à la version exacte de `@playwright/test`). Les dépendances vivent dans le volume nommé `node_modules`, et le conteneur tourne avec l'UID et le GID de la machine : les fichiers générés ne sont pas à root.

## Démarrage

```sh
git clone https://github.com/kewinMarchand/boilerplate-svelte.git
cd boilerplate-svelte
cp .env.example .env
make install   # image de dev (Node, Chromium) et dépendances
make up        # http://localhost:5173, rechargement à chaud
```

Le site lit ses données dans une API de test lancée à côté : [boilerplate-api-platform](https://github.com/kewinMarchand/boilerplate-api-platform) sur le port 8090 (défaut) ou [boilerplate-hono](https://github.com/kewinMarchand/boilerplate-hono) sur le port 8091, au même contrat. `API_URL` choisit l'une ou l'autre. Les tests e2e ont besoin de l'API lancée.

Variables d'environnement (`.env`, déclarées et validées dans `src/env.ts`). Le `Makefile` charge `.env` et l'exporte vers chaque commande, `make start` le relit aussi :

| Variable                                     | Rôle                                                                                                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PUBLIC_SITE_URL`                            | URL publique, utilisée pour les URL canoniques, Open Graph, le JSON-LD et le sitemap                                                                   |
| `ORIGIN`                                     | Origine servie par `make start`, figée par `make build` (protection CSRF des formulaires, voir `CLAUDE.md`)                                            |
| `MAINTENANCE`                                | `1` : toutes les pages répondent 503 avec la page de maintenance statique, dans la langue de l'adresse                                                 |
| `DEV_ROUTES`                                 | `1` : expose `/charte-graphique` et `/_erreur-test` hors du serveur de développement                                                                   |
| `GLITCHTIP_DSN`, `PUBLIC_GLITCHTIP_DSN`      | Suivi des erreurs GlitchTip, côté serveur et navigateur. Vides : aucun SDK chargé, aucune requête                                                      |
| `PUBLIC_GLITCHTIP_ENVIRONMENT`               | Environnement déclaré à GlitchTip (défaut : `development` ou `production`)                                                                             |
| `PUBLIC_MATOMO_URL`, `PUBLIC_MATOMO_SITE_ID` | Mesure d'audience Matomo sans cookie. Vides : aucun script, aucune requête, pas de paragraphe sur la page Données personnelles                         |
| `API_URL`                                    | Origine de l'API : `http://localhost:8090` (API Platform, défaut) ou `http://localhost:8091` (Hono), même contrat. Lue par le serveur et le navigateur |
| `API_SCENARIO`                               | Scénario de l'API (`X-Scenario`) pour tous les appels, serveur et navigateur : `bilingual` sert le site bilingue de test. Vide en production           |
| `API_SCHEMA_URL`                             | Schéma OpenAPI de l'API consommée, lu par `make api-types`                                                                                             |

## Démarrer un projet à partir de ce dépôt

### Créer le dépôt

Voie recommandée : le dépôt est un modèle GitHub. Cliquer sur « Use this template », ou en ligne de commande :

```sh
gh repo create mon-projet --template kewinMarchand/boilerplate-svelte --private --clone
```

Le nouveau dépôt part d'un historique neuf, sans lien avec celui-ci.

Voie du fork, pour suivre les évolutions du boilerplate ou y contribuer :

```sh
gh repo fork kewinMarchand/boilerplate-svelte --clone --fork-name mon-projet
```

Le fork devient le dépôt `origin` et ce dépôt le dépôt `upstream`. GitHub refuse de forker un dépôt dans le compte qui le possède : dans ce cas, forker dans une organisation avec `--org`.

### Récupérer les mises à jour

Avec un fork, l'historique est commun :

```sh
git fetch upstream
git merge upstream/main
```

Avec un dépôt créé depuis le modèle, l'historique n'est pas commun : on reprend les commits utiles un par un.

```sh
git remote add boilerplate https://github.com/kewinMarchand/boilerplate-svelte.git
git fetch boilerplate
git log --oneline boilerplate/main
git cherry-pick <sha>
```

### Personnaliser

| Sujet                      | Fichiers                                                                                                                                                                                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nom du paquet              | `package.json` (`name`, `description`)                                                                                                                                                                                                                            |
| Identité et config du site | `src/lib/shared/config/site.ts` (nom, description, éditeur pour le SEO, audit d'accessibilité pour le lien du pied de page), `.env.example` (`PUBLIC_SITE_URL`), `static/manifest.webmanifest`, `src/app.html` (`theme-color`), `LICENSE`                         |
| Navigation                 | `src/lib/shared/config/navigation.ts` (menu, pied de page, sitemap, plan du site)                                                                                                                                                                                 |
| Libellés de l'interface    | `src/lib/shared/i18n/dictionaries/fr.ts` et `en.ts` (mêmes clés, vérifiées par le type et un test)                                                                                                                                                                |
| Couleurs, police, tokens   | `src/lib/shared/theme/theme.css`                                                                                                                                                                                                                                  |
| Ports                      | développement : `package.json` (script `dev`) et `vite.config.ts` (5173). Tests : `playwright.config.ts` (3120), `tests/e2e/production.e2e.ts` (3121). Lighthouse : `.lighthouserc.json` (3220). Production : `Dockerfile`, `compose.yaml`, `.env.example` (3000) |
| Logo et favicons           | `static/logo-mark.svg`, `static/favicon.svg`, `static/favicon.ico`, `static/apple-touch-icon.png`, `static/icon-192.png`, `static/icon-512.png`, `static/og-image.jpg`                                                                                            |
| Pages légales              | texte et carrousel de l'accueil dans l'admin de l'API Platform (`/admin`), lus par le module `content` (`GET /api/legal_pages/{slug}`, `GET /api/slides`). `src/lib/views/legal/` garde la mesure d'audience (Matomo) et le plan du site                          |
| URL Lighthouse             | `.lighthouserc.json` (`collect.url`)                                                                                                                                                                                                                              |
| Intégration continue       | `.github/workflows/ci.yml`                                                                                                                                                                                                                                        |
| Documentation              | `README.md`, `CLAUDE.md`                                                                                                                                                                                                                                          |

Les tests e2e attendent les ports 3120 et 5173 en dur (`tests/e2e/seo.e2e.ts`, `tests/e2e/breadcrumb.e2e.ts`, `src/lib/shared/seo/breadcrumb.test.ts`, `vitest.setup.ts`) : les changer en même temps que les ports.

### Retirer les modules d'exemple

Le catalogue, le blog et les tâches sont des exemples. Le contact reste, c'est le seul module que la procédure garde. Déroulée sur une copie, elle mène à un `make qa` vert.

1. Supprimer les modules et leurs routes : `src/lib/modules/catalog/`, `src/lib/modules/blog/`, `src/lib/modules/task/`, `src/routes/catalogue/`, `src/routes/taches/`, `src/routes/+page.server.ts` (articles de l'accueil) et `src/routes/+layout.server.ts` (menu des catégories).
2. Retirer le catalogue du socle. Dans `src/lib/shared/config/navigation.ts` et son `index.ts`, supprimer `CATALOG_NAVIGATION`, le type `NavigationNode` et l'entrée `/taches`. Dans `src/lib/shared/ui/layout/`, retirer la propriété `categoryMenu` d'`AppShell.svelte` et de `Header.svelte`, retirer le menu de catégories du header, ramener `MobileMenu.svelte` à la liste de `MAIN_NAVIGATION`, puis supprimer `CategoryMenu.svelte` et les hooks `useCascadeMenu`, `useAnchoredPanel` et `useDrillDown`, devenus inutiles. Les classes `category-menu*` de `theme.css` peuvent partir aussi.
3. Mettre à jour les vues et les routes qui les rendent :
   - `src/lib/views/home/HomeView.svelte` : retirer la section des articles et la propriété `blog`, et `src/routes/+page.svelte` ne lui passe plus de données
   - `src/lib/views/home/Hero.svelte` : retirer le bouton vers `/taches`
   - `src/lib/views/styleguide/MediaSection.svelte` : retirer les cartes de blog et de produit
   - `src/lib/views/errors/ErrorView.svelte` : retirer le lien vers le catalogue
   - `src/lib/views/legal/SitemapView.svelte` : retirer l'arbre des catégories et supprimer `SitemapTree.svelte`, et `src/routes/plan-du-site/+page.svelte` rend la vue sans données
   - `src/routes/+layout.svelte` : rendre `AppShell` sans propriété
   - `src/routes/sitemap.xml/+server.ts` : appeler `buildSitemapXml()` sans les chemins du catalogue.
4. Adapter les tests. Supprimer `tests/e2e/catalogue.e2e.ts`, `tests/e2e/taches.e2e.ts` et `tests/e2e/category-menu.e2e.ts`. Retirer les routes `/taches`, `/catalogue` et `/catalogue/plantes-interieur/feuillages` de `tests/e2e/routes.ts`, et les cas du catalogue, du blog et des tâches dans `accueil.e2e.ts`, `breadcrumb.e2e.ts`, `errors.e2e.ts`, `seo.e2e.ts`, `layout.e2e.ts` et `tests/a11y/pages.a11y.ts`.
5. Retirer les URL `/taches` et `/catalogue...` de `.lighthouserc.json`.
6. Repointer l'auto-test d'architecture. `tools/archSelftest.ts` écrit ses violations dans les modules d'exemple : les déplacer vers `src/lib/modules/contact/` (domaine vers infrastructure par `../infrastructure/sendContactMessage`, domaine vers framework, interface vers un index de module, types générés hors infrastructure) et vers `#lib/modules/contact` pour le socle, la vue et le routage. Les deux cas qui demandent un module avec `application/` (application vers framework, interface vers infrastructure) n'ont plus de cible : les retirer, puis les rétablir au premier module en forme complète.
7. Lancer `make qa`, puis `make test-e2e`, `make test-a11y` et `make metrics`. Mettre à jour `README.md` et `CLAUDE.md`.

Les règles de dépendance n'ont rien à changer : `eslint.config.js` lit la liste des modules sur le disque.

## Commandes

`make help` liste toutes les commandes. Les principales :

| Commande                               | Effet                                                                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `make up`                              | Serveur de développement (port 5173)                                                                                  |
| `make build` / `make start`            | Build de production, puis le servir                                                                                   |
| `make qa`                              | QA rapide : lint (dont architecture), auto-test des règles, sprite d'icônes, format, types, tests unitaires           |
| `make icons`                           | Génère `static/icons.svg` et le type des noms depuis `icons.json`                                                     |
| `make arch-selftest`                   | Écrit une violation de chaque règle d'architecture, exige l'échec d'ESLint, puis la retire                            |
| `make qa-full`                         | QA complète : QA rapide, e2e, accessibilité, Lighthouse                                                               |
| `make test-unit`                       | Vitest                                                                                                                |
| `make test-e2e`                        | Playwright, desktop et mobile (port 3120)                                                                             |
| `make test-a11y`                       | axe-core, WCAG 2.1 AA, sur chaque page, mode standard et mode renforcé                                                |
| `make metrics`                         | Lighthouse CI (port 3220) en clair puis en sombre : échoue sous 90 en performance ou sous 100 en accessibilité et SEO |
| `make api-types`                       | Génère `src/lib/shared/api/schema.d.ts` depuis `API_SCHEMA_URL`                                                       |
| `make docker-down`                     | Arrête les conteneurs, dont ceux de dev                                                                               |
| `make docker-build` / `make docker-up` | Image de production, sur le port `PORT` (3000 par défaut)                                                             |

## Architecture

Le front est un seul contexte borné, découpé en **modules** par sous-domaine métier, et en **couches** à l'intérieur de chaque module (vocabulaire d'Evans et de Khononov, détaillé dans le document d'architecture commun aux boilerplates).

```
src/
  routes/                 routage uniquement : chaque route délègue à une vue ou à l'index d'un module
  lib/                    alias natif #lib (subpath imports de package.json)
    views/                pages sans métier ou qui composent des modules : home, legal, errors, styleguide
    modules/
      catalog/            forme complète
        domain/           types (namespace Catalog), value objects, règles pures, sans framework
        application/      cas d'utilisation côté serveur : chargement de page, menu, chemins du sitemap
        infrastructure/   accès aux données : catalogRepository.ts appelle l'API
          http/           traduction entre le contrat de l'API et le domaine (seule à importer les types générés)
        ui/               composants, hooks en runes (*.svelte.ts), vue rendue par la route
        index.ts          seul export public côté client
        index.server.ts   seul export public côté serveur (load, actions)
      blog/, contact/, content/, task/   forme réduite : domain/, infrastructure/, ui/, sans application/
    shared/               socle sans métier : config, thème, SEO, routage, providers, erreurs,
                          ui/ (kit, layout, carousel, a11y-mode, hooks), api/ (client typé, types générés)
tests/
  e2e/                    un fichier par page ou par brique
  a11y/                   audit axe de chaque page, dans les deux modes
tools/
  archSelftest.ts         auto-test des règles d'architecture
```

Règles de dépendance, vérifiées par ESLint (`@boundaries/eslint-plugin`) :

- le routage importe les vues, l'index public des modules et le socle ;
- une vue importe l'index public des modules et le socle ;
- un module n'importe jamais un autre module, la composition se fait dans `views/` ;
- le socle n'importe ni module, ni vue, ni routage : il reçoit les données métier en propriétés (le menu de catégories est fourni par `+layout.server.ts`) ;
- dans un module, `domain/` n'importe que lui-même (et des types du socle), `application/` le domaine et l'infrastructure, `infrastructure/` le domaine et les types générés de l'API, `ui/` le domaine, l'application et l'interface (l'infrastructure seulement si le module n'a pas d'`application/`) ;
- les types générés de l'API (`shared/api/`) ne sont importés que par `infrastructure/`.

`make arch-selftest`, lancé par `make qa`, écrit une violation volontaire de chaque règle à son emplacement réel, exige l'échec d'ESLint, puis la retire.

Le `CLAUDE.md` de ce dépôt note les choix propres au projet, les versions épinglées et les pièges connus.

## Recettes

### Ajouter une page

1. Page sans métier : créer `src/lib/views/<nom>/` avec sa vue `<Nom>View.svelte` et son `index.ts`. Page d'un module : la vue va dans `ui/` du module et sort par son `index.ts`. La vue commence par `<PageHeader>` (titre, description, fil d'Ariane, métadonnées).
2. Créer `src/routes/<route>/+page.svelte`, qui rend la vue. Un chargement serveur passe par `+page.server.ts` et l'`index.server.ts` du module.
3. Ajouter la route à `src/lib/shared/config/navigation.ts` (menu, sitemap, plan du site) et à `tests/e2e/routes.ts` (réponse, SEO, débordement, accessibilité).
4. Écrire `tests/e2e/<route>.e2e.ts`.

### Charger des données avec TanStack Query

Le pattern est dans `src/lib/modules/task/` :

- `infrastructure/taskRepository.ts` appelle `GET /api/tasks` depuis le navigateur avec le client typé, `infrastructure/http/taskTranslation.ts` traduit la réponse en `Task.Entity`.
- `ui/hooks/useTasks.svelte.ts` encapsule `createQuery`, avec une clé de cache exportée et une erreur de chargement (`TasksLoadError`).
- `ui/TaskList.svelte` affiche les trois états à partir de props, ce qui le rend testable sans réseau.

### Ajouter un champ de formulaire

1. Ajouter le champ dans `src/lib/modules/contact/domain/contactSchema.ts`, son message d'erreur dans `ValidationMessages` et dans `contact.validation` des deux dictionnaires (`src/lib/shared/i18n/dictionaries/`). Le type du formulaire en découle.
2. Ajouter le `TextField` dans `ContactForm.svelte`, libellé tiré du dictionnaire, avec `errors={$errors.champ}` et `bind:value={$form.champ}`. Le message est relié au champ par `aria-describedby`.

### Langues du site

Un site n'a qu'une langue, le français, tant que l'identité du site (`GET /api/site-identity`, administrée dans l'API) n'en active pas d'autre : routes, HTML et appels à l'API restent alors ceux d'un site monolingue. À plus d'une langue (la première est la langue par défaut) :

- la langue par défaut n'a pas de préfixe, les autres en ont un (`/en/produit/swiss-cheese-plant`) ; un préfixe qui n'est pas une langue activée répond 404, sans redirection selon le navigateur ;
- l'en-tête montre un sélecteur de langue, qui mène à la même page dans l'autre langue, ou à son accueil si la page n'y existe pas ;
- chaque lecture de l'API passe `locale=<langue de la page>`, le contact envoie sa langue en `Accept-Language` ;
- `<html lang>`, canonique, `og:locale`, `hreflang` (et `x-default`), `inLanguage` et sitemap suivent la langue de la page.

Libellés : une clé par texte dans `src/lib/shared/i18n/dictionaries/fr.ts` et `en.ts` (`{nom}` remplacé par `format`, pluriels par `plural`), lue dans un composant par `const t = useDictionary()`. Le navigateur ne reçoit que les sections utiles : celles de l'en-tête, du pied et de la page d'erreur depuis `src/routes/+layout.server.ts` (`LAYOUT_SECTIONS`), celles d'une page depuis son `load` (`pageDictionary: dictionarySections(locals.locale, ['catalog'])`) ; une section lue par un composant doit y figurer. Un lien interne passe par `resolveHref`, qui ajoute le préfixe de la page. Une langue activée sans dictionnaire prend les libellés de la langue par défaut. Pour voir le site bilingue des fixtures : `API_SCENARIO=bilingual` dans `.env`, puis `make build start`.

### Composants de boilerplates-ui

Tokens, CSS et comportement des composants génériques viennent de [boilerplates-ui](https://github.com/kewinMarchand/boilerplates-ui), documentés dans son [Storybook](https://kewinmarchand.github.io/boilerplates-ui/). Les composants Svelte viennent de la couche `svelte` de la bibliothèque, par la façade `src/lib/shared/ui/kit/` : alerte, badge, boutons, case, interrupteur, puce, liste déroulante, squelette, et deux adaptateurs du site (champ superforms, tiroir avec son déclencheur). L'icône reste celle du site (son sprite). La charte graphique (`/charte-graphique`) montre leur rendu dans le site.

Monter de version : changer l'étiquette dans `package.json` (`github:kewinMarchand/boilerplates-ui#vX.Y.Z`), lancer `make install`, puis relire le journal des versions de la bibliothèque.

### CSP et rapports de violation

Chaque réponse porte un en-tête `Content-Security-Policy-Report-Only` construit par [`@kewinmarchand/csp`](https://github.com/kewinMarchand/csp), dans `src/lib/shared/security/` : rien n'est bloqué, le navigateur signale chaque ressource qu'une CSP stricte refuserait à `POST /api/csp-report`, qui écrit une ligne lisible sur la sortie standard du serveur :

```
[csp-report] https://cdn.exemple.com a besoin d'une autorisation de type script (script-src) — bloqué sur /contact
```

- **Lire les logs** : `docker compose logs -f web` pour l'image de production, la sortie de `make up` en développement, la console de l'hébergeur en production. Au démarrage, `[boilerplate-svelte] serveur démarré (production)` permet de retrouver le bon fichier.
- **Autoriser une origine** : l'ajouter à sa directive (le nom est entre parenthèses dans la ligne) dans `siteCsp()` de `src/lib/shared/security/csp.ts`. L'API (`API_URL`), Matomo et GlitchTip y sont déjà, quand leur variable est renseignée.
- **Pourquoi Report-Only et `'unsafe-inline'`** : on collecte d'abord ce que le site charge vraiment avant de bloquer quoi que ce soit ; l'hydratation de SvelteKit écrit du script en ligne, et un nonce par réponse rendrait toutes les pages dynamiques.

### Ajouter une icône

Ajouter son nom Lucide (lucide.dev/icons) dans `icons.json`, lancer `make icons`, puis versionner `icons.json`, `static/icons.svg` et `src/lib/shared/ui/kit/iconNames.ts`. L'utiliser avec `<Icon name="nom" />`. `make qa` échoue si le sprite n'a pas été régénéré.

## Tests

- **Unitaires et fonctionnels** : fichiers `*.test.ts` à côté du code testé.
- **End-to-end** : Playwright sert le build de production sur le port 3120, routes de développement activées. Le site bilingue (`tests/e2e/bilingue.e2e.ts`) est le même build, servi avec `API_SCENARIO=bilingual` sur les ports 3128 et 3129. Les éléments sont ciblés par `data-testid`, préfixé par le domaine (`catalog-sort`, `contact-submit`). Chaque rendu conditionnel est testé présent et absent. Les captures de mise en page sont écrites dans `screenshots/`.
- **Accessibilité** : `tests/a11y/` passe axe-core sur chaque route, la 404, la 500, la charte et le menu ouvert, en mode standard et renforcé. Axe ne couvre qu'une partie du RGAA, un audit manuel reste nécessaire.

## Intégration continue

`.github/workflows/ci.yml` lance `make qa`, puis les tests e2e, accessibilité et Lighthouse, à chaque push sur `main` et sur chaque pull request. En cas d'échec, le rapport Playwright est joint au run.

## Licence

MIT
