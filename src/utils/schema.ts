import { HardcoverParams } from "@/main"
import { BookStatusKey } from "@/types"
import { SortDirection, SortType } from "./query"

export function validateParams(obj: unknown): HardcoverParams | null {
  if (typeof obj !== "object" || obj === null) return null

  const params = obj as Record<string, unknown>

  if (typeof params.limit !== "number" || params.limit < 1) return null

  const validStatuses: BookStatusKey[] = [
    "dnf",
    "paused",
    "read",
    "reading",
    "tbr",
  ]
  if (
    typeof params.status !== "string" ||
    !validStatuses.includes(params.status as BookStatusKey)
  ) {
    return null
  }

  if (params.sort !== undefined) {
    if (typeof params.sort !== "string") return null

    const validSortTypes: SortType[] = ["progress", "added", "updated"]
    const validDirections: SortDirection[] = ["asc", "desc"]

    if (params.sort.includes(".")) {
      const [sortType, direction] = params.sort.split(".")
      if (
        !validSortTypes.includes(sortType as SortType) ||
        !validDirections.includes(direction as SortDirection)
      ) {
        return null
      }
    } else if (!validSortTypes.includes(params.sort as SortType)) {
      return null
    }
  }

  return {
    limit: params.limit,
    status: params.status as BookStatusKey,
    sort: params.sort as HardcoverParams["sort"],
  }
}
