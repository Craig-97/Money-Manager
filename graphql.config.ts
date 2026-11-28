import codegen from './codegen';

// Read by the GraphQL VS Code extension (and other graphql-config tools) for autocomplete,
// validation and go-to-definition in the .graphql documents. The schema and documents come from
// codegen.ts so the two can't drift apart.
const config = {
  schema: codegen.schema,
  documents: codegen.documents,
  extensions: { codegen }
};

export default config;
