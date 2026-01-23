<script lang="ts">
  import type { createUpdateProgressStore } from "@stores/books"
  import BookCover from "@ui/BookCover.svelte"
  import Progress from "@ui/Progress.svelte"
  import { BOOK_STATUS } from "@/constants"
  import type { UserBook } from "@/types"

  export let userBook: UserBook
  export let updateProgressStore: ReturnType<typeof createUpdateProgressStore>

  $: latestRead = userBook?.user_book_reads?.[0] || null
  $: totalPages =
    latestRead?.edition?.pages ?? userBook?.book?.pages ?? undefined
  $: coverUrl = latestRead?.edition?.image?.url ?? userBook?.book?.image?.url
  $: shouldShowProgress =
    latestRead?.edition?.id &&
    latestRead?.user_book?.status_id === BOOK_STATUS.reading
</script>

<div class="hardcover-book">
    {#if coverUrl}
        <BookCover {userBook} {coverUrl} />
    {/if}
    {#if shouldShowProgress && latestRead?.edition?.id}
        <Progress
            editionId={latestRead.edition.id}
            readingSession={latestRead}
            {totalPages}
            {updateProgressStore}
        />
    {/if}
</div>
