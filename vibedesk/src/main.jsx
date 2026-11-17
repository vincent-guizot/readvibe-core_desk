import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppProvider from './app/provider/AppProvider'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './styles/index.css'
import App from './app/App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)
