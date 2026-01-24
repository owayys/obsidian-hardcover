import { DEFAULT_PARAMS, DEFAULT_SORTING_FOR_STATUS } from "@/constants"
import { HardcoverParams } from "@/main"
import { BookStatusParam, SortDirection, SortType } from "@/types"

export function parseParams(obj: unknown): HardcoverParams {
  if (typeof obj !== "object" || obj === null) return DEFAULT_PARAMS

  const params = obj as Record<string, unknown>
  const result: HardcoverParams = { ...DEFAULT_PARAMS }

  if (typeof params.limit === "number" && params.limit >= 1) {
    result.limit = params.limit
  }

  const validStatuses: BookStatusParam[] = [
    "dnf",
    "paused",
    "read",
    "reading",
    "tbr",
  ]
  if (
    typeof params.status === "string" &&
    validStatuses.includes(params.status as BookStatusParam)
  ) {
    result.status = params.status as BookStatusParam

    if (params.sort === undefined) {
      result.sort = DEFAULT_SORTING_FOR_STATUS[result.status]
    }
  }

  if (params.sort !== undefined) {
    if (typeof params.sort === "string") {
      const validSortTypes: SortType[] = ["progress", "added", "updated"]
      const validDirections: SortDirection[] = ["asc", "desc"]

      if (params.sort.includes(".")) {
        const [sortType, direction] = params.sort.split(".")
        if (
          validSortTypes.includes(sortType as SortType) &&
          validDirections.includes(direction as SortDirection)
        ) {
          result.sort = params.sort as HardcoverParams["sort"]
        }
      } else if (validSortTypes.includes(params.sort as SortType)) {
        result.sort = params.sort as HardcoverParams["sort"]
      }
    }
  }

  return result
}
