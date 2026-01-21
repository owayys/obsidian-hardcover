import { writable } from "svelte/store"
import { BOOK_STATUS } from "@/constants"
import { getHardcoverClient } from "@/stores/factory"
import type { UserBook } from "@/types"
import { createQueryStore, type QueryStore } from "./queryStore"

export function createUserBooksStore(
  limit: number,
  status: keyof typeof BOOK_STATUS,
): QueryStore<UserBook[]> {
  return createQueryStore(async () => {
    const hardcoverClient = getHardcoverClient()
    if (!hardcoverClient) {
      throw new Error("Hardcover client not initialized")
    }

    const result = await hardcoverClient.getUserBooks(
      limit,
      BOOK_STATUS[status],
    )
    return result.me?.[0]?.user_books ?? []
  }, [])
}

export function createUpdateProgressStore(onSuccess?: () => Promise<void>) {
  const { subscribe, set, update } = writable({
    isLoading: false,
    isError: false,
    error: null as Error | null,
  })

  return {
    subscribe,

    async updateReadingProgress(
      readingSessionId: number,
      editionId: number,
      progressPages: number,
    ) {
      update((state) => ({
        ...state,
        isLoading: true,
        isError: false,
        error: null,
      }))

      try {
        const hardcoverClient = getHardcoverClient()
        if (!hardcoverClient) {
          throw new Error("Hardcover client not initialized")
        }

        const result = await hardcoverClient.updateReadingProgress(
          readingSessionId,
          editionId,
          progressPages,
        )

        if (onSuccess) {
          await onSuccess()
        }

        set({ isLoading: false, isError: false, error: null })
        return result
      } catch (error) {
        const errorObj =
          error instanceof Error
            ? error
            : new Error("Failed to update reading progress")
        update((state) => ({
          ...state,
          isLoading: false,
          isError: true,
          error: errorObj,
        }))
        throw errorObj
      }
    },
  }
}
