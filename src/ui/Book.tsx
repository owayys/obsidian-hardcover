import { Progress } from "@ui/Progress"
import * as React from "react"
import type { UserBook } from "@/types"

interface BookProps {
  userBook: UserBook
}

export const Book: React.FC<BookProps> = ({ userBook }) => {
  const latestRead = userBook.user_book_reads?.[0]
  const totalPages = userBook.book.pages ?? undefined

  const coverUrl = userBook.edition?.image?.url ?? userBook.book.image?.url

  return (
    <div className="hardcover-book">
      {coverUrl && (
        <div className="hardcover-book-cover">
          <img
            alt={userBook.book.title ?? "Book cover"}
            loading="lazy"
            src={coverUrl}
          />
        </div>
      )}

      <div className="hardcover-book-info">
        {userBook.last_read_date && (
          <div className="hardcover-book-last-read">
            Last read: {new Date(userBook.last_read_date).toLocaleDateString()}
          </div>
        )}
      </div>

      {latestRead && (
        <Progress readingSession={latestRead} totalPages={totalPages} />
      )}
    </div>
  )
}
