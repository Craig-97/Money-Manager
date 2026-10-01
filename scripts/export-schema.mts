// Prints the API's GraphQL schema into src/graphql/schema.graphql, which is the input for `npm run codegen`
// and the fake API used by the component tests. The API repo is expected next to this one,
// or set API_PATH to its location.
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildASTSchema, parse, printSchema } from 'graphql';

const apiPath = path.resolve(process.env.API_PATH ?? '../Money-Manager-API');
const { typeDefs } = await import(pathToFileURL(path.join(apiPath, 'typeDefs', 'index.ts')).href);

const document = typeof typeDefs === 'string' ? parse(typeDefs) : typeDefs;
writeFileSync('src/graphql/schema.graphql', printSchema(buildASTSchema(document)) + '\n');
console.log(`Wrote src/graphql/schema.graphql from ${apiPath}`);
