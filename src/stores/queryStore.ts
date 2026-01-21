import { derived, type Readable, writable } from "svelte/store"

export interface QueryState<TData> {
  data: TData | null
  isLoading: boolean
  isRefetching: boolean
  isError: boolean
  error: Error | null
}

export interface QueryStore<TData> extends Readable<QueryState<TData>> {
  fetch: () => Promise<void>
  refetch: () => Promise<void>
  clear: () => void
}

export function createQueryStore<TData>(
  queryFn: () => Promise<TData>,
  initialData: TData | null = null,
): QueryStore<TData> {
  const { subscribe, set, update } = writable<QueryState<TData>>({
    data: initialData,
    isLoading: false,
    isRefetching: false,
    isError: false,
    error: null,
  })

  async function executeQuery(isRefetch = false) {
    update((state) => ({
      ...state,
      [isRefetch ? "isRefetching" : "isLoading"]: true,
      isError: false,
      error: null,
    }))

    try {
      const result = await queryFn()
      set({
        data: result,
        isLoading: false,
        isRefetching: false,
        isError: false,
        error: null,
      })
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error("Unknown error occurred")
      update((state) => ({
        ...state,
        isLoading: false,
        isRefetching: false,
        isError: true,
        error: errorObj,
      }))
    }
  }

  return {
    subscribe,
    fetch: () => executeQuery(false),
    refetch: () => executeQuery(true),
    clear: () =>
      set({
        data: initialData,
        isLoading: false,
        isRefetching: false,
        isError: false,
        error: null,
      }),
  }
}

export function deriveQueryState<TData>(store: QueryStore<TData>): {
  data: Readable<TData | null>
  isLoading: Readable<boolean>
  isRefetching: Readable<boolean>
  isError: Readable<boolean>
  error: Readable<Error | null>
} {
  return {
    data: derived(store, ($store) => $store.data),
    isLoading: derived(store, ($store) => $store.isLoading),
    isRefetching: derived(store, ($store) => $store.isRefetching),
    isError: derived(store, ($store) => $store.isError),
    error: derived(store, ($store) => $store.error),
  }
}
