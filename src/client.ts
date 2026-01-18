import { requestUrl } from "obsidian"
import type { TypedDocumentString } from "@/api/client/graphql"
import {
  GetUserCurrentBooksDocument,
  type GetUserCurrentBooksQuery,
  UpdateUserBookReadDocument,
  type UpdateUserBookReadMutation,
  type UpdateUserBookReadMutationVariables,
} from "@/api/client/graphql"

interface GraphQLError {
  message: string
}

const HARDCOVER_API_URL = "https://api.hardcover.app/v1/graphql"

export class HardcoverClient {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private async query<TData, TVariables extends Record<string, unknown>>(
    document: TypedDocumentString<TData, TVariables>,
    variables?: TVariables,
  ): Promise<TData> {
    if (!this.token) {
      throw new Error("Hardcover API token not configured")
    }

    try {
      const response = await requestUrl({
        url: HARDCOVER_API_URL,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          query: document,
          variables: variables || {},
        }),
      })

      // biome-ignore lint/suspicious/noExplicitAny: external API response
      const result: any = response.json

      if (result.errors && result.errors.length > 0) {
        const errorMessage = result.errors
          .map((e: GraphQLError) => e.message)
          .join(", ")
        throw new Error(`GraphQL Error: ${errorMessage}`)
      }

      if (!result.data) {
        throw new Error("No data returned from Hardcover API")
      }

      return result.data as TData
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error(`Failed to query Hardcover API: ${String(error)}`)
    }
  }

  async getUserCurrentBooks(): Promise<GetUserCurrentBooksQuery> {
    return this.query(GetUserCurrentBooksDocument)
  }

  async updateReadingProgress(
    readingSessionId: number,
    progressPages: number,
    progressSeconds?: number,
  ): Promise<UpdateUserBookReadMutation> {
    const variables: UpdateUserBookReadMutationVariables = {
      id: readingSessionId,
      object: {
        progress_pages: progressPages,
        ...(progressSeconds && { progress_seconds: progressSeconds }),
      },
    }
    return this.query(UpdateUserBookReadDocument, variables)
  }

  setToken(token: string): void {
    this.token = token
  }
}
