import { BOOK_STATUS } from "./constants"

export interface Book {
  id: number
  title?: string | null
  image?: {
    url?: string | null
  } | null
  pages?: number | null
}

export interface Edition {
  id: number
  image?: {
    url?: string | null
  } | null
}

export interface ReadingSession {
  id: number
  progress_pages?: number | null
  progress_seconds?: number | null
  progress?: number | null
  started_at?: string | null
  edition?: {
    id: number
    pages?: number | null
    image?: {
      url?: string | null
    } | null
  } | null
  user_book?: {
    status_id?: (typeof BOOK_STATUS)[keyof typeof BOOK_STATUS] | null
  } | null
}

export interface UserBook {
  book: Book
  user_book_reads?: ReadingSession[] | null
}

export interface HardcoverBooksResponse {
  me?: Array<{
    user_books?: UserBook[] | null
  }> | null
}

export interface UpdateUserBookReadResponse {
  update_user_book_read?: {
    id: number
    user_book_read?: {
      id: number
      progress_pages?: number | null
      progress?: number | null
    } | null
  } | null
}
