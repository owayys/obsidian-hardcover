import { useCurrentBooks } from "@hooks/progress"
import { Book } from "@ui/Book"
import * as React from "react"

interface BookListProps {
  className?: string
}

export const BookList: React.FC<BookListProps> = ({ className }) => {
  const {
    data: userBooks = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useCurrentBooks()

  const onRefresh = async () => {
    await refetch()
  }

  if (isLoading) {
    return (
      <div className={`hardcover-loading ${className || ""}`}>
        <div className="hardcover-loading-container">
          <div className="spinner" />
          <div className="hardcover-loading-text">Loading your books...</div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={`hardcover-error ${className || ""}`}>
        <div className="hardcover-error-container">
          <div className="hardcover-error-title">❌ Failed to load books</div>
          <div className="hardcover-error-message">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </div>
          <button
            className="hardcover-error-retry"
            onClick={() => {
              void refetch()
            }}
            type="button">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (userBooks.length === 0) {
    return (
      <div className={`hardcover-empty ${className || ""}`}>
        <div className="hardcover-empty-container">
          <div className="hardcover-empty-icon">📚</div>
          <div className="hardcover-empty-title">
            No books currently reading
          </div>
          <div className="hardcover-empty-subtitle">
            Start reading a book in Hardcover to see it here
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`hardcover-book-list ${className || ""}`}>
      {userBooks.map((userBook) => (
        <Book key={userBook.book.id} userBook={userBook} />
      ))}
      <button
        className="hardcover-list-refresh-button"
        disabled={isLoading || isRefetching}
        onClick={onRefresh}
        type="button">
        {isRefetching ? "⟳" : "↻"}
      </button>
    </div>
  )
}
