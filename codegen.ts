import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  hooks: { afterAllFileWrite: ['prettier --write'] },
  schema: 'src/graphql/schema.graphql',
  // Operations live in .graphql files next to the code that uses them
  documents: ['src/**/*.graphql', '!src/graphql/schema.graphql'],
  generates: {
    'src/graphql/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
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
    }
  }
};

export default config;
