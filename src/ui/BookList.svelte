<script lang="ts">
  import { onMount } from "svelte"
  import {
    userBooksStore,
    userBooks,
    isLoading,
    error,
    isRefetching,
  } from "@stores/books"
  import Book from "@ui/Book.svelte"
  import { UserBook } from "@/types"
  import { HardcoverParams } from "@/main"

  export let className: string | undefined = undefined
  export let params: HardcoverParams

  let userBooksData: UserBook[] = []
  let loadingData = true
  let errorData: Error | null = null
  let refetchingData = false

  onMount(() => {
    userBooksStore.fetchUserBooks(params.limit, params.status)

    const unsubscribeUserBooks = userBooks.subscribe((value) => {
      userBooksData = Array.isArray(value) ? value : []
    })
    const unsubscribeLoading = isLoading.subscribe((value) => {
      loadingData = Boolean(value)
    })
    const unsubscribeError = error.subscribe((value) => {
      errorData = value
    })
    const unsubscribeRefetching = isRefetching.subscribe((value) => {
      refetchingData = Boolean(value)
    })

    return () => {
      unsubscribeUserBooks()
      unsubscribeLoading()
      unsubscribeError()
      unsubscribeRefetching()
    }
  })

  async function onRefetch() {
    await userBooksStore.refetchUserBooks(params.limit, params.status)
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
            <div class="hardcover-error-title">❌ Failed to load books</div>
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
            <div class="hardcover-empty-title">No books currently reading</div>
            <div class="hardcover-empty-subtitle">
                Start reading a book in Hardcover to see it here
            </div>
        </div>
    </div>
{:else}
    <div class={`hardcover-book-list ${className || ""}`}>
        {#each userBooksData as userBook (userBook?.book?.id || Math.random())}
            {@const bookId = userBook?.book?.id}
            {#if bookId}
                <Book {userBook} />
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
