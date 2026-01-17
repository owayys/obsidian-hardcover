import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { HardcoverClient } from "../client"
import { queryKeys } from "./queryKeys"

let hardcoverClient: HardcoverClient | null = null

export const initializeHardcoverClient = (token: string) => {
  hardcoverClient = new HardcoverClient(token)
}

export const getHardcoverClient = () => hardcoverClient

export const useCurrentBooks = () => {
  return useQuery({
    queryKey: queryKeys.currentBooks(),
    queryFn: async () => {
      if (!hardcoverClient) {
        throw new Error("Hardcover client not initialized")
      }
      const result = await hardcoverClient.getUserCurrentBooks()
      return result.me?.[0]?.user_books ?? []
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useUpdateReadingProgress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      readingSessionId,
      progressPages,
      progressSeconds,
    }: {
      readingSessionId: number
      progressPages: number
      progressSeconds?: number
    }) => {
      if (!hardcoverClient) {
        throw new Error("Hardcover client not initialized")
      }
      return hardcoverClient.updateReadingProgress(
        readingSessionId,
        progressPages,
        progressSeconds,
      )
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        queryKeys.userBookRead(variables.readingSessionId),
        data,
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.currentBooks() })
    },
    onError: (error) => {
      console.error("Failed to update reading progress:", error)
    },
  })
}
