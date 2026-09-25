/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_TAGLINE?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_NODE_ID?: string;
  readonly VITE_TELEGRAM_BOT_USERNAME?: string;
  readonly VITE_TELEGRAM_BOT_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_ENABLE_OFFLINE_FALLBACK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
