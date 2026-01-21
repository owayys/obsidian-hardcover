<script lang="ts">
  import type { createUpdateProgressStore } from "@stores/books"
  import { Notice } from "obsidian"
  import { onDestroy, onMount } from "svelte"
  import type { ReadingSession } from "@/types"

  export let readingSession: ReadingSession
  export let editionId: number
  export let totalPages: number | undefined = undefined
  export let updateProgressStore: ReturnType<typeof createUpdateProgressStore>

  let isLoading = false
  let showPercentage = false
  const debounceTimers = new Map<number, number>()

  $: pages = readingSession?.progress_pages ?? 0
  $: percentage = readingSession?.progress ?? 0

  onMount(() => {
    const unsubscribe = updateProgressStore.subscribe(
      (state: { isLoading: boolean }) => {
        isLoading = state.isLoading
      },
    )

    return unsubscribe
  })

  onDestroy(() => {
    debounceTimers.forEach((timer) => {
      clearTimeout(timer)
    })
    debounceTimers.clear()
  })

  function debouncedUpdate(fn: () => Promise<void>, delayMs = 500) {
    const sessionId = readingSession?.id
    if (!sessionId) return

    const timer = debounceTimers.get(sessionId)
    if (timer) {
      clearTimeout(timer)
    }

    const newTimer = window.setTimeout(async () => {
      try {
        await fn()
      } catch (error) {
        console.error("Failed to update progress:", error)
        new Notice("Failed to update reading progress")
      }
      debounceTimers.delete(sessionId)
    }, delayMs)

    debounceTimers.set(sessionId, newTimer)
  }

  function handleIncrementPages() {
    const newPages = pages + 1

    debouncedUpdate(async () => {
      await updateProgressStore.updateReadingProgress(
        readingSession?.id || 0,
        editionId,
        newPages,
      )
    })
  }

  function handleDecrementPages() {
    if (pages <= 0) return

    const newPages = pages - 1

    debouncedUpdate(async () => {
      await updateProgressStore.updateReadingProgress(
        readingSession?.id || 0,
        editionId,
        newPages,
      )
    })
  }

  function toggleDisplay() {
    showPercentage = !showPercentage
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggleDisplay()
    }
  }

  $: progressText = showPercentage
    ? `${percentage.toFixed(0)}%`
    : totalPages
      ? `${pages}/${totalPages}`
      : `${pages} pages`
</script>

<div class="hardcover-progress">
  <button
    aria-label="Decrement pages"
    disabled={isLoading || pages <= 0}
    on:click={handleDecrementPages}
    type="button">
    −
  </button>

  <div
    class="hardcover-progress-text"
    on:click={toggleDisplay}
    on:keydown={handleKeyDown}
    tabindex="0"
    role="button">
    {progressText}
  </div>

  <button
    aria-label="Increment pages"
    disabled={isLoading}
    on:click={handleIncrementPages}
    type="button">
    +
  </button>
</div>
