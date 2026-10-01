import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  hooks: { afterAllFileWrite: ['prettier --write'] },
  schema: 'src/graphql/schema.graphql',
  documents: ['src/graphql/queries/*.ts', 'src/graphql/mutations/*.ts'],
  generates: {
    'src/graphql/generated.ts': {
      plugins: ['typescript-operations'],
      config: {
        // String unions instead of TypeScript enums
        enumsAsTypes: true,
        useTypeImports: true,
        skipTypename: true,
        avoidOptionals: false,
        maybeValue: 'T | null'
      }
    }
  }
};

export default config;
