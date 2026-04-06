/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_SOCKET_URL?: string
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv
}
