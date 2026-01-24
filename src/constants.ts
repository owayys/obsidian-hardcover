import { HardcoverParams } from "@/main"
import { PluginSettings } from "@/settings"
import { BookStatusParam, SortParam } from "@/types"

export const BOOK_STATUS = {
  tbr: 1,
  reading: 2,
  read: 3,
  paused: 4,
  dnf: 5,
}

export const BOOK_COVER_FALLBACK =
  "https://production-img.hardcover.app/enlarge?url=https://assets.hardcover.app/static/covers/cover5.webp&width=180&height=270&type=webp"

export const DEFAULT_PARAMS = {
  limit: 5,
  status: "reading",
  sort: "progress.desc",
} satisfies HardcoverParams

export const DEFAULT_SORTING_FOR_STATUS: Record<BookStatusParam, SortParam> = {
  tbr: "added.desc",
  reading: "progress.desc",
  read: "updated.desc",
  paused: "added.asc",
  dnf: "added.asc",
}

export const DEFAULT_SETTINGS: PluginSettings = {
  TOKEN_SECRET_KEY: "",
}

export const DEBOUNCE_MS = 1000
