export const BOOK_STATUS = {
  TBR: 1,
  READING: 2,
  READ: 3,
  PAUSED: 4,
  DNF: 5,
  IGNORED: 6,
}

export const BOOK_STATUS_LABELS = {
  [BOOK_STATUS.TBR]: "want to read",
  [BOOK_STATUS.READING]: "are currently reading",
  [BOOK_STATUS.READ]: "have finished reading",
  [BOOK_STATUS.PAUSED]: "have paused reading",
  [BOOK_STATUS.DNF]: "did not finish reading",
  [BOOK_STATUS.IGNORED]: "have ignored",
} as const

export const DEBOUNCE_MS = 1000
