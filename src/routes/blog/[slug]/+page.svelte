<script lang="ts">
  import { ArticleView } from '#lib/modules/blog'

  const { data } = $props()
</script>

<ArticleView article={data.article} />
