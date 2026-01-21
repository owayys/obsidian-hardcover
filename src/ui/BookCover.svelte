<script lang="ts">
  import type { UserBook } from "@/types"

  export let userBook: UserBook
  export let coverUrl: string | undefined

  let imageLoaded = false
  let imageError = false

  function handleImageLoad() {
    imageLoaded = true
  }

  function handleImageError() {
    imageError = true
    imageLoaded = false
  }
</script>

<div class="hardcover-book-cover">
	{#if !imageLoaded && !imageError && coverUrl}
		<div class="hardcover-cover-skeleton"></div>
	{/if}

	{#if coverUrl && !imageError}
		<img
			alt={userBook?.book?.title ?? "Book cover"}
			loading="lazy"
			src={coverUrl}
			title={userBook?.book?.title ?? "Book cover"}
			on:load={handleImageLoad}
			on:error={handleImageError}
		/>
	{:else if imageError}
		<div class="hardcover-cover-placeholder">
			<span class="hardcover-cover-placeholder-icon">📖</span>
		</div>
	{/if}
</div>

