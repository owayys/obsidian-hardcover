import { getHardcoverClient } from "@hooks/client"
import { derived, writable } from "svelte/store"
import { BOOK_STATUS } from "@/constants"
import type { UserBook } from "@/types"

export interface LoadingState {
  isLoading: boolean
  isRefetching: boolean
  isError: boolean
  error: Error | null
}

export interface UserBooksState {
  data: UserBook[]
  loading: LoadingState
}

function createUserBooksStore() {
  const { subscribe, set, update } = writable<UserBooksState>({
    data: [],
    loading: {
      isLoading: false,
      isRefetching: false,
      isError: false,
      error: null,
    },
  })

  return {
    subscribe,

    async fetchUserBooks(limit: number, status: keyof typeof BOOK_STATUS) {
      update((state) => ({
        ...state,
        loading: {
          ...state.loading,
          isLoading: true,
          isError: false,
          error: null,
        },
      }))

      try {
        const hardcoverClient = getHardcoverClient()
        if (!hardcoverClient) {
          throw new Error("Hardcover client not initialized")
        }

        const result = await hardcoverClient.getUserBooks(
          limit,
          BOOK_STATUS[status],
        )
        const userBooks = result.me?.[0]?.user_books ?? []

        set({
          data: userBooks,
          loading: {
            isLoading: false,
            isRefetching: false,
            isError: false,
            error: null,
          },
        })
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error("Unknown error occurred")
        update((state) => ({
          ...state,
          loading: {
            ...state.loading,
            isLoading: false,
            isError: true,
            error: errorObj,
          },
        }))
      }
    },

    async refetchUserBooks(limit: number, status: keyof typeof BOOK_STATUS) {
      update((state) => ({
        ...state,
        loading: { ...state.loading, isRefetching: true },
      }))

      try {
        const hardcoverClient = getHardcoverClient()
        if (!hardcoverClient) {
          throw new Error("Hardcover client not initialized")
        }

        const result = await hardcoverClient.getUserBooks(
          limit,
          BOOK_STATUS[status],
        )
        const userBooks = result.me?.[0]?.user_books ?? []

        update((state) => ({
          ...state,
          data: userBooks,
          loading: { ...state.loading, isRefetching: false },
        }))
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error("Unknown error occurred")
        update((state) => ({
          ...state,
          loading: {
            ...state.loading,
            isRefetching: false,
            isError: true,
            error: errorObj,
          },
        }))
      }
    },

    clear() {
      set({
        data: [],
        loading: {
          isLoading: false,
          isRefetching: false,
          isError: false,
          error: null,
        },
      })
    },
  }
}

export interface UpdateProgressState {
  isLoading: boolean
  isError: boolean
  error: Error | null
}

function createUpdateProgressStore() {
  const { subscribe, set, update } = writable<UpdateProgressState>({
    isLoading: false,
    isError: false,
    error: null,
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

        // Update the user books store to reflect the changes
        userBooksStore.refetchUserBooks(10, "READING") // Default values, could be improved

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

export const userBooksStore = createUserBooksStore()
export const updateProgressStore = createUpdateProgressStore()

export const userBooks = derived(
  userBooksStore,
  ($userBooksStore) => $userBooksStore.data,
)
export const isLoading = derived(
  userBooksStore,
  ($userBooksStore) => $userBooksStore.loading.isLoading,
)
export const isRefetching = derived(
  userBooksStore,
  ($userBooksStore) => $userBooksStore.loading.isRefetching,
)
export const isError = derived(
  userBooksStore,
  ($userBooksStore) => $userBooksStore.loading.isError,
)
export const error = derived(
  userBooksStore,
  ($userBooksStore) => $userBooksStore.loading.error,
)
export const isUpdatingProgress = derived(
  updateProgressStore,
  ($updateProgressStore) => $updateProgressStore.isLoading,
)
