// Type definitions based on GraphQL schema
export interface Book {
  id: number
  title?: string | null
  image?: {
    url?: string | null
  } | null
  default_physical_edition_id?: number | null
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
  user_book?: {
    status_id?: number | null
    edition_id?: number | null
  } | null
}

export interface UserBook {
  book: Book
  edition?: Edition | null
  user_book_reads?: ReadingSession[] | null
  last_read_date?: string | null
  first_started_reading_date?: string | null
}

export interface HardcoverBooksResponse {
  me?: Array<{
    user_books?: UserBook[] | null
  }> | null
}

export interface EditionPageCountResponse {
  editions_by_pk?: {
    id: number
    book?: {
      pages?: number | null
    } | null
  } | null
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
