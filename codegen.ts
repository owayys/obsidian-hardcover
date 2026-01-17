import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  overwrite: true,
  schema: {
    "https://api.hardcover.app/v1/graphql": {
      headers: {
        authorization: `Bearer ${process.env.HARDCOVER_AUTH_TOKEN}`,
      },
    },
  },
  documents: "src/api/operations/**/*.graphql",
  generates: {
    "src/api/client/": {
      preset: "client",
      config: {
        documentMode: "string",
        scalars: {
          date: "string",
          timestamptz: "string",
          timestamp: "string",
          bigint: "number",
          citext: "string",
          float8: "number",
          json: "Record<string, any>",
          jsonb: "Record<string, any>",
          numeric: "number",
          smallint: "number",
        },
      },
    },
    "src/api/schema.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
  },
}

export default config
