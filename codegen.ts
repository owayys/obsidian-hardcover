import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      "https://api.hardcover.app/v1/graphql": {
        headers: {
          authorization: `Bearer ${process.env.HARDCOVER_AUTH_TOKEN}`,
        },
      },
    },
  ],
  generates: {
    "src/api/client/": {
      preset: "client",
      config: {
        documentMode: "string",
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
