/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query GetUserCurrentBooks {\n  me {\n    user_books(where: {user_book_status: {id: {_eq: 2}}}) {\n      book {\n        image {\n          url\n        }\n        id\n        title\n        pages\n      }\n      user_book_reads {\n        id\n        progress_pages\n        progress\n        edition {\n          id\n          pages\n          image {\n            url\n          }\n        }\n      }\n    }\n  }\n}": typeof types.GetUserCurrentBooksDocument,
    "mutation UpdateUserBookRead($id: Int!, $object: DatesReadInput!) {\n  update_user_book_read(id: $id, object: $object) {\n    user_book_read {\n      progress\n      progress_pages\n      edition_id\n    }\n  }\n}": typeof types.UpdateUserBookReadDocument,
};
const documents: Documents = {
    "query GetUserCurrentBooks {\n  me {\n    user_books(where: {user_book_status: {id: {_eq: 2}}}) {\n      book {\n        image {\n          url\n        }\n        id\n        title\n        pages\n      }\n      user_book_reads {\n        id\n        progress_pages\n        progress\n        edition {\n          id\n          pages\n          image {\n            url\n          }\n        }\n      }\n    }\n  }\n}": types.GetUserCurrentBooksDocument,
    "mutation UpdateUserBookRead($id: Int!, $object: DatesReadInput!) {\n  update_user_book_read(id: $id, object: $object) {\n    user_book_read {\n      progress\n      progress_pages\n      edition_id\n    }\n  }\n}": types.UpdateUserBookReadDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetUserCurrentBooks {\n  me {\n    user_books(where: {user_book_status: {id: {_eq: 2}}}) {\n      book {\n        image {\n          url\n        }\n        id\n        title\n        pages\n      }\n      user_book_reads {\n        id\n        progress_pages\n        progress\n        edition {\n          id\n          pages\n          image {\n            url\n          }\n        }\n      }\n    }\n  }\n}"): typeof import('./graphql').GetUserCurrentBooksDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateUserBookRead($id: Int!, $object: DatesReadInput!) {\n  update_user_book_read(id: $id, object: $object) {\n    user_book_read {\n      progress\n      progress_pages\n      edition_id\n    }\n  }\n}"): typeof import('./graphql').UpdateUserBookReadDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
