import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if (!import.meta.env.VITE_API_URL) {
  console.warn('ISDS: VITE_API_URL not set. API calls will go to same origin (may fail on Vercel).')
}
if (!import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
  console.info('ISDS: Google Sign-In not configured. Set VITE_GOOGLE_CLIENT_ID to enable.')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
