/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_ETA_API_URL: string
  readonly VITE_POSITION_API_URL: string
  readonly VITE_RISK_API_URL: string
  readonly VITE_CONFIRMATION_API_URL: string
  readonly VITE_INCIDENT_API_URL: string
  readonly VITE_DEMO_MODE: string
  readonly VITE_DEBUG: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}