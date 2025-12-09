import '@/index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import FallbackComponent from '@/FallbackComponent'
import App from '@/App'

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary FallbackComponent={FallbackComponent}>
        <App />
      </ErrorBoundary>
    </StrictMode>
  )
}
