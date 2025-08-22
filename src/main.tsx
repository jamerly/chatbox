import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App serverUrl='' appId='' language='en' welcomeMessage='Hello, welcome to our application!' />
  </StrictMode>,
)
