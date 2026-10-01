// The fake API runs against the real API's schema, exported by `npm run schema:export`
import typeDefs from '../graphql/schema.graphql?raw';

export { typeDefs };
