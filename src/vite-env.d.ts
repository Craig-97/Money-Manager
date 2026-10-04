/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_API_URL?: string;
  readonly VITE_PROD_API_URL?: string;
  // Development only: 'true' runs against the in-memory fake API
  readonly VITE_MOCK_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
