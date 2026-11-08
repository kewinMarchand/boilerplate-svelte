<script lang="ts">
  import { HomeView } from '#lib/views/home'

  const { data } = $props()
</script>

<HomeView
  blog={data.blog}
  featured={data.featured}
  identity={data.siteIdentity}
  pageMeta={data.pageMetas['/']}
/>
