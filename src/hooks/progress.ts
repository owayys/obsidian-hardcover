import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getHardcoverClient } from "./client"
import { queryKeys } from "./queryKeys"

export interface CurrentBooksParams {
  limit: number
}

export const useCurrentBooks = ({ limit }: CurrentBooksParams) => {
  return useQuery({
    queryKey: queryKeys.currentBooks(),
    queryFn: async () => {
      const hardcoverClient = getHardcoverClient()
      if (!hardcoverClient) {
        throw new Error("Hardcover client not initialized")
      }
      const result = await hardcoverClient.getUserCurrentBooks(limit)
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
      editionId,
      progressPages,
    }: {
      readingSessionId: number
      editionId: number
      progressPages: number
    }) => {
      const hardcoverClient = getHardcoverClient()
      if (!hardcoverClient) {
        throw new Error("Hardcover client not initialized")
      }
      return hardcoverClient.updateReadingProgress(
        readingSessionId,
        editionId,
        progressPages,
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
