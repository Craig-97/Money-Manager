import { createApolloClient } from './createApolloClient';

// The app's single client. Kept at module level, never in React state.
// In development, VITE_MOCK_API=true swaps the API for the in-memory one (see src/dev/mockClient).
// The condition is false in production builds, so the mock isn't bundled.
export const client =
  import.meta.env.DEV && import.meta.env.VITE_MOCK_API === 'true'
    ? (await import('~/dev/mockClient')).createMockClient()
    : createApolloClient();
