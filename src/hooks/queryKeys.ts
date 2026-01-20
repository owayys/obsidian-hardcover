export const queryKeys = {
  all: ["hardcover"] as const,
  userBooks: (limit?: number, status?: string) =>
    [...queryKeys.all, "userBooks", limit, status] as const,
  editionPageCount: (editionId: number) =>
    [...queryKeys.all, "editionPageCount", editionId] as const,
  userBookRead: (id: number) => [...queryKeys.all, "userBookRead", id] as const,
} as const
