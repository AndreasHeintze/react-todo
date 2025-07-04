import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import FallbackComponent from './FallbackComponent.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <App />
    </ErrorBoundary>
  </StrictMode>
)
