/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Where the API is; the site's own /graphql unless set
  readonly VITE_API_URL?: string;
  // Development only: 'true' runs against the in-memory fake API
  readonly VITE_MOCK_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
