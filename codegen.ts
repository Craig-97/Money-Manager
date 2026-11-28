import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  hooks: { afterAllFileWrite: ['prettier --write'] },
  schema: 'src/graphql/schema.graphql',
  // Operations live in .graphql files next to the code that uses them
  documents: ['src/**/*.graphql', '!src/graphql/schema.graphql'],
  generates: {
    // Every schema type, e.g. the enums the app uses in its own code
    'src/graphql/generated/schema.ts': {
      plugins: ['typescript'],
      config: {
        // String unions instead of TypeScript enums
        enumsAsTypes: true,
        useTypeImports: true,
        // Nullable fields are `T | null`, nullable inputs can be left out
        avoidOptionals: { field: true, inputValue: false },
        defaultScalarType: 'unknown',
        nonOptionalTypename: true,
        skipTypeNameForRoot: true
      }
    },
    // The operations and their result types. They import the schema's input and enum types from
    // schema.ts rather than declaring their own copies.
    'src/graphql/generated/graphql.ts': {
      plugins: ['typescript-operations', 'typed-document-node'],
      config: {
        importSchemaTypesFrom: 'src/graphql/generated/schema.ts',
        enumsAsTypes: true,
        useTypeImports: true,
        avoidOptionals: { field: true, inputValue: false },
        defaultScalarType: 'unknown',
        nonOptionalTypename: true,
        skipTypeNameForRoot: true
      }
    }
  }
};

export default config;
