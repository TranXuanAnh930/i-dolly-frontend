export const API_PORT = '8000'
// Vercel (and any local .env.local) supplies VITE_API_URL at build time;
// falls back to the local backend so `npm run dev` works with zero setup.
export const API_URL = import.meta.env.VITE_API_URL || `http://localhost:${API_PORT}`
export const DOMAIN_TITLE = 'I-Dolly'
