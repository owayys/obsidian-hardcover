// biome-ignore-all lint/a11y/noStaticElementInteractions lint/a11y/noNoninteractiveTabindex: need interactive div

import { useUpdateReadingProgress } from "@hooks/books"
import { Notice } from "obsidian"
import * as React from "react"
import type { ReadingSession } from "@/types"

interface ProgressProps {
  readingSession: ReadingSession
  editionId: number
  totalPages?: number
}

export const Progress: React.FC<ProgressProps> = ({
  readingSession,
  editionId,
  totalPages,
}) => {
  const [localProgress, setLocalProgress] = React.useState({
    pages: readingSession.progress_pages ?? 0,
    percentage: readingSession.progress ?? 0,
  })
  const [showPercentage, setShowPercentage] = React.useState(false)

  const updateProgressMutation = useUpdateReadingProgress()

  React.useEffect(() => {
    setLocalProgress({
      pages: readingSession.progress_pages ?? 0,
      percentage: readingSession.progress ?? 0,
    })
  }, [readingSession])

  const debounceTimers = React.useRef<Map<number, number>>(new Map())

  const debouncedUpdate = React.useCallback(
    (fn: () => Promise<void>, delayMs = 1000) => {
      const timer = debounceTimers.current.get(readingSession.id)
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
        debounceTimers.current.delete(readingSession.id)
      }, delayMs)

      debounceTimers.current.set(readingSession.id, newTimer)
    },
    [readingSession.id],
  )

  React.useEffect(() => {
    return () => {
      debounceTimers.current.forEach((timer) => {
        clearTimeout(timer)
      })
      debounceTimers.current.clear()
    }
  }, [])

  const handleIncrementPages = () => {
    const newPages = localProgress.pages + 1
    const newPercentage = totalPages
      ? Math.round((newPages / totalPages) * 100)
      : localProgress.percentage

    setLocalProgress({ pages: newPages, percentage: newPercentage })

    debouncedUpdate(async () => {
      void updateProgressMutation.mutateAsync({
        readingSessionId: readingSession.id,
        editionId,
        progressPages: newPages,
      })
    })
  }

  const handleDecrementPages = () => {
    if (localProgress.pages <= 0) return

    const newPages = localProgress.pages - 1
    const newPercentage = totalPages
      ? Math.round((newPages / totalPages) * 100)
      : localProgress.percentage

    setLocalProgress({ pages: newPages, percentage: newPercentage })

    debouncedUpdate(async () => {
      void updateProgressMutation.mutateAsync({
        readingSessionId: readingSession.id,
        editionId,
        progressPages: newPages,
      })
    })
  }

  const isLoading = updateProgressMutation.isPending

  const toggleDisplay = () => {
    setShowPercentage(!showPercentage)
  }

  return (
    <div className="hardcover-progress">
      <button
        aria-label="Decrement pages"
        disabled={isLoading || localProgress.pages <= 0}
        onClick={handleDecrementPages}
        type="button">
        −
      </button>

      <div
        className="hardcover-progress-text"
        onClick={toggleDisplay}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            toggleDisplay()
          }
        }}
        tabIndex={0}>
        {showPercentage
          ? `${localProgress.percentage.toFixed(0)}%`
          : totalPages
            ? `${localProgress.pages}/${totalPages}`
            : `${localProgress.pages} pages`}
      </div>

      <button
        aria-label="Increment pages"
        disabled={isLoading}
        onClick={handleIncrementPages}
        type="button">
        +
      </button>
    </div>
  )
}
