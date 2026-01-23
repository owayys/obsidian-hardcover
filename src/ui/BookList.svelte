<script lang="ts">
  import {
    createUpdateProgressStore,
    createUserBooksStore,
  } from "@stores/books"
  import Book from "@ui/Book.svelte"
  import { onDestroy } from "svelte"
  import { BOOK_STATUS, BOOK_STATUS_LABELS } from "@/constants"
  import { HardcoverParams } from "@/main"
  import { UserBook } from "@/types"

  export let className: string = ""
  export let params: HardcoverParams

  let userBooksData: UserBook[] = []
  let loadingData = true
  let errorData: Error | null = null
  let refetchingData = false

  const userBooksStore = createUserBooksStore(params)
  userBooksStore.fetch()

  const updateProgressStore = createUpdateProgressStore(() =>
    userBooksStore.refetch(),
  )

  const unsubscribe = userBooksStore.subscribe((state) => {
    userBooksData = state.data ?? []
    loadingData = state.isLoading
    errorData = state.error
    refetchingData = state.isRefetching
  })

  onDestroy(() => {
    unsubscribe()
  })

  async function onRefetch() {
    await userBooksStore.refetch()
  }
</script>

{#if loadingData}
    <div class={`hardcover-loading ${className || ""}`}>
        <div class="hardcover-loading-container">
            <div class="spinner"></div>
            <div class="hardcover-loading-text">Loading your books...</div>
        </div>
    </div>
{:else if errorData}
    <div class={`hardcover-error ${className || ""}`}>
        <div class="hardcover-error-container">
            <div class="hardcover-error-title">Failed to load books</div>
            <div class="hardcover-error-message">
                {errorData?.message || "Unknown error occurred"}
            </div>
            <button
                class="hardcover-error-retry"
                on:click={onRefetch}
                type="button"
            >
                Retry
            </button>
        </div>
    </div>
{:else if userBooksData.length === 0}
    <div class={`hardcover-empty ${className || ""}`}>
        <div class="hardcover-empty-container">
            <div class="hardcover-empty-icon">📚</div>
            <div class="hardcover-empty-title">No books matching your search, try adjusting your params.</div>
            <div class="hardcover-empty-subtitle">
                Add your books in Hardcover to see them here
            </div>
        </div>
    </div>
{:else}
    <div class={`hardcover-book-list ${className || ""}`}>
        {#each userBooksData as userBook (userBook?.book?.id || Math.random())}
            {@const bookId = userBook?.book?.id}
            {#if bookId}
                <Book {userBook} {updateProgressStore} />
            {/if}
        {/each}
        <button
            disabled={loadingData || refetchingData}
            on:click={onRefetch}
            type="button"
        >
            {refetchingData ? "⟳" : "↻"}
        </button>
    </div>
{/if}
