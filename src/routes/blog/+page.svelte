<script lang="ts">
  import { BlogListView } from '#lib/modules/blog'

  const { data } = $props()
</script>

<BlogListView blog={data.blog} sections={data.sections} activeSection={data.activeSection} />
