import { Progress } from "@ui/Progress"
import * as React from "react"
import { BOOK_STATUS } from "@/constants"
import type { UserBook } from "@/types"

interface BookProps {
  userBook: UserBook
}

export const Book: React.FC<BookProps> = ({ userBook }) => {
  const latestRead = userBook.user_book_reads?.[0]
  const totalPages =
    latestRead?.edition?.pages ?? userBook.book.pages ?? undefined

  const coverUrl = latestRead?.edition?.image?.url ?? userBook.book.image?.url

  return (
    <div className="hardcover-book">
      {coverUrl && (
        <div className="hardcover-book-cover">
          <img
            alt={userBook.book.title ?? "Book cover"}
            loading="lazy"
            src={coverUrl}
            title={userBook.book.title ?? "Book cover"}
          />
        </div>
      )}

      {latestRead?.edition?.id &&
        latestRead.user_book?.status_id === BOOK_STATUS.READING && (
          <Progress
            editionId={latestRead.edition.id}
            readingSession={latestRead}
            totalPages={totalPages}
          />
        )}
    </div>
  )
}
