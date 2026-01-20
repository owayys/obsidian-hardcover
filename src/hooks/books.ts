import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BOOK_STATUS } from "@/constants"
import { BookStatusKey } from "@/types"
import { getHardcoverClient } from "./client"
import { queryKeys } from "./queryKeys"

export interface CurrentBooksParams {
  limit: number
  status: BookStatusKey
}

export const useUserBooks = ({ limit, status }: CurrentBooksParams) => {
  return useQuery({
    queryKey: queryKeys.userBooks(limit, status),
    queryFn: async () => {
      const hardcoverClient = getHardcoverClient()
      if (!hardcoverClient) {
        throw new Error("Hardcover client not initialized")
      }
      const result = await hardcoverClient.getUserBooks(
        limit,
        BOOK_STATUS[status],
      )
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
      queryClient.invalidateQueries({ queryKey: queryKeys.userBooks() })
    },
    onError: (error) => {
      console.error("Failed to update reading progress:", error)
    },
  })
}
