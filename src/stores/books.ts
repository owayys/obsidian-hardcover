import {
  BuildUserBooksOrderParams,
  SortDirection,
  SortType,
} from "@utils/query"
import { createQueryStore, type QueryStore } from "@utils/store"
import { writable } from "svelte/store"
import { BOOK_STATUS } from "@/constants"
import { HardcoverParams } from "@/main"
import { getHardcoverClient } from "@/stores/factory"
import type { UserBook } from "@/types"

export function createUserBooksStore({
  limit,
  status,
  sort,
}: HardcoverParams): QueryStore<UserBook[]> {
  return createQueryStore(async () => {
    const hardcoverClient = getHardcoverClient()
    if (!hardcoverClient) {
      throw new Error("Hardcover client not initialized")
    }

    let sortOptions: BuildUserBooksOrderParams | undefined

    if (sort) {
      const [f, d] = sort.split(".")
      sortOptions = { sortType: f as SortType, direction: d as SortDirection }
    }

    const result = await hardcoverClient.getUserBooks(
      limit,
      BOOK_STATUS[status],
      ...(sortOptions ? [sortOptions] : []),
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
