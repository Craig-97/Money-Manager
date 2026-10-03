import { createApolloClient } from './createApolloClient';

// The app's single client. Kept at module level, never in React state.
export const client = createApolloClient();
