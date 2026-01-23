import {
  GetUserBooksQueryVariables,
  Order_By,
  User_Books_Order_By,
} from "@api/generated/graphql"

export type SortType = "progress" | "added" | "updated"
export type SortDirection = "asc" | "desc"

export interface BuildUserBooksOrderParams {
  sortType: SortType
  direction?: SortDirection
}

const DIRECTION_MAP: Record<SortDirection, Order_By> = {
  asc: Order_By.AscNullsLast,
  desc: Order_By.DescNullsLast,
}

export const buildUserBooksOrder = ({
  sortType,
  direction,
}: BuildUserBooksOrderParams): GetUserBooksQueryVariables["orderBy"] => {
  const mappedDirection = DIRECTION_MAP[direction || "desc"]

  const orderByMap: Record<SortType, User_Books_Order_By> = {
    progress: {
      user_book_reads_aggregate: {
        max: {
          progress: mappedDirection,
        },
      },
    },
    added: {
      date_added: mappedDirection,
    },
    updated: {
      reading_journal_summary: {
        last_updated_at: mappedDirection,
      },
    },
  }

  return [orderByMap[sortType]]
}
