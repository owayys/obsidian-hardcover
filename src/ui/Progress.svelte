<script lang="ts">
  import type { createUpdateProgressStore } from "@stores/books"
  import { Notice } from "obsidian"
  import { onDestroy, onMount } from "svelte"
  import { DEBOUNCE_MS } from "@/constants"
  import type { ReadingSession } from "@/types"

  export let readingSession: ReadingSession
  export let editionId: number
  export let totalPages: number | undefined = undefined
  export let updateProgressStore: ReturnType<typeof createUpdateProgressStore>

  let isLoading = false
  let showPercentage = false
  const debounceTimers = new Map<number, number>()

  let localProgress = {
    pages: readingSession?.progress_pages ?? 0,
    percentage: readingSession?.progress ?? 0,
  }

  $: {
    if (readingSession && !isLoading) {
      localProgress = {
        pages: readingSession.progress_pages ?? 0,
        percentage: readingSession.progress ?? 0,
      }
    }
  }

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

  function debouncedUpdate(fn: () => Promise<void>, delayMs = DEBOUNCE_MS) {
    const sessionId = readingSession?.id
    if (!sessionId) return

    const timer = debounceTimers.get(sessionId)
    if (timer) {
      clearTimeout(timer)
    }

    const newTimer = window.setTimeout(async () => {
      isLoading = true
      try {
        await fn()
      } catch (error) {
        console.error("Failed to update progress:", error)
        new Notice("Failed to update reading progress")
      } finally {
        isLoading = false
        debounceTimers.delete(sessionId)
      }
    }, delayMs)

    debounceTimers.set(sessionId, newTimer)
  }

  function handleIncrementPages() {
    const newPages = localProgress.pages + 1
    const newPercentage = totalPages
      ? Math.round((newPages / totalPages) * 100)
      : localProgress.percentage

    localProgress = {
      pages: newPages,
      percentage: newPercentage,
    }

    debouncedUpdate(async () => {
      await updateProgressStore.updateReadingProgress(
        readingSession?.id || 0,
        editionId,
        newPages,
      )
    })
  }

  function handleDecrementPages() {
    if (localProgress.pages <= 0) return
    const newPages = localProgress.pages - 1
    const newPercentage = totalPages
      ? Math.round((newPages / totalPages) * 100)
      : localProgress.percentage

    localProgress = {
      pages: newPages,
      percentage: newPercentage,
    }

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
    ? `${localProgress.percentage.toFixed(0)}%`
    : totalPages
      ? `${localProgress.pages}/${totalPages}`
      : `${localProgress.pages} pages`
</script>

<div class="hardcover-progress">
  <button
    aria-label="Decrement pages"
    disabled={isLoading || localProgress.pages <= 0}
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
