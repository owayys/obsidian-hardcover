<script lang="ts">
  import { BOOK_STATUS } from "@/constants"
  import Progress from "@ui/Progress.svelte"
  import type { UserBook } from "@/types"

  export let userBook: UserBook

  $: latestRead = userBook?.user_book_reads?.[0] || null
  $: totalPages =
    latestRead?.edition?.pages ?? userBook?.book?.pages ?? undefined
  $: coverUrl = latestRead?.edition?.image?.url ?? userBook?.book?.image?.url
  $: shouldShowProgress =
    latestRead?.edition?.id &&
    latestRead?.user_book?.status_id === BOOK_STATUS.READING
</script>

<div class="hardcover-book">
    {#if coverUrl}
        <div class="hardcover-book-cover">
            <img
                alt={userBook?.book?.title ?? "Book cover"}
                loading="lazy"
                src={coverUrl}
                title={userBook?.book?.title ?? "Book cover"}
            />
        </div>
    {/if}
    {#if shouldShowProgress && latestRead?.edition?.id}
        <Progress
            editionId={latestRead.edition.id}
            readingSession={latestRead}
            {totalPages}
        />
    {/if}
</div>
