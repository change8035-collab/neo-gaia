import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/do-hyeon'
import '@fontsource/gowun-dodum'
import '@fontsource/nanum-pen-script'
import App from './App.tsx'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
