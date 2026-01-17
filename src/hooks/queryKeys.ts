export const queryKeys = {
  all: ["hardcover"] as const,
  currentBooks: () => [...queryKeys.all, "currentBooks"] as const,
  editionPageCount: (editionId: number) =>
    [...queryKeys.all, "editionPageCount", editionId] as const,
  userBookRead: (id: number) => [...queryKeys.all, "userBookRead", id] as const,
} as const
