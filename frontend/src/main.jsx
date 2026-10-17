import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './kickoff.css'
import KickOffApp from './KickOffApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <KickOffApp />
  </StrictMode>,
)
