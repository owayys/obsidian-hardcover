/**
 * Hardcover.app GraphQL API client using Obsidian's requestUrl
 */

import { requestUrl } from "obsidian";
import type { TypedDocumentString } from "./api/client/graphql";
import {
	GetUserCurrentBooksDocument,
	type GetUserCurrentBooksQuery,
	GetEditionPageCountDocument,
	type GetEditionPageCountQuery,
	UpdateUserBookReadDocument,
	type UpdateUserBookReadMutation,
	type UpdateUserBookReadMutationVariables,
} from "./api/client/graphql";

interface GraphQLError {
	message: string;
}

const HARDCOVER_API_URL = "https://api.hardcover.app/v1/graphql";

export class HardcoverClient {
	private token: string;

	constructor(token: string) {
		this.token = token;
	}

	/**
	 * Generic GraphQL query method with type safety
	 * @param document Typed GraphQL document from codegen
	 * @param variables Optional query variables
	 * @returns Typed response data
	 */
	private async query<TData, TVariables extends Record<string, unknown>>(
		document: TypedDocumentString<TData, TVariables>,
		variables?: TVariables
	): Promise<TData> {
		if (!this.token) {
			throw new Error("Hardcover API token not configured");
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
			});

			// biome-ignore lint/suspicious/noExplicitAny: external API response
			const result: any = response.json;

			// Check for GraphQL errors
			if (result.errors && result.errors.length > 0) {
				const errorMessage = result.errors
					.map((e: GraphQLError) => e.message)
					.join(", ");
				throw new Error(`GraphQL Error: ${errorMessage}`);
			}

			if (!result.data) {
				throw new Error("No data returned from Hardcover API");
			}

			return result.data as TData;
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error(`Failed to query Hardcover API: ${String(error)}`);
		}
	}

	/**
	 * Get user's current books (reading status: 2)
	 */
	async getUserCurrentBooks(): Promise<GetUserCurrentBooksQuery> {
		return this.query(GetUserCurrentBooksDocument);
	}

	/**
	 * Get page count for an edition
	 */
	async getEditionPageCount(
		editionId: number
	): Promise<GetEditionPageCountQuery> {
		return this.query(GetEditionPageCountDocument, { editionId });
	}

	/**
	 * Update reading progress for a user book read session
	 * @param readingSessionId The user_book_reads ID
	 * @param progressPages Current page number
	 * @param progressSeconds Reading time in seconds (optional)
	 */
	async updateReadingProgress(
		readingSessionId: number,
		progressPages: number,
		progressSeconds?: number
	): Promise<UpdateUserBookReadMutation> {
		const variables: UpdateUserBookReadMutationVariables = {
			id: readingSessionId,
			object: {
				progress_pages: progressPages,
				...(progressSeconds && { progress_seconds: progressSeconds }),
			},
		};
		return this.query(UpdateUserBookReadDocument, variables);
	}

	/**
	 * Update reading progress by percentage
	 * @param readingSessionId The user_book_reads ID
	 * @param editionId The edition ID to get page count
	 * @param percentage Progress percentage (0-100)
	 */
	async updateReadingProgressByPercentage(
		readingSessionId: number,
		editionId: number,
		percentage: number
	): Promise<UpdateUserBookReadMutation> {
		// Validate percentage
		if (percentage < 0 || percentage > 100) {
			throw new Error("Percentage must be between 0 and 100");
		}

		// Get edition page count
		const editionData = await this.getEditionPageCount(editionId);
		const totalPages = editionData.editions_by_pk?.book?.pages;

		if (!totalPages) {
			throw new Error("Could not determine book page count");
		}

		// Calculate progress pages
		const progressPages = Math.round((percentage / 100) * totalPages);

		// Update progress
		return this.updateReadingProgress(readingSessionId, progressPages);
	}

	/**
	 * Update token (in case it needs to be refreshed)
	 */
	setToken(token: string): void {
		this.token = token;
	}
}
