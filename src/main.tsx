import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AuthProvider } from './features/auth/AuthProvider.tsx'
import './index.css'

/**
 * Both providers live here, not in <App />, so tests can mount <App /> inside a
 * <MemoryRouter> (driving the flow by URL) and their own <AuthProvider> (seeding
 * whatever auth state a test needs). Whatever this file owns, tests cannot swap.
 *
 * AuthProvider sits outside the router: auth state does not depend on where the
 * user is, and the router never needs to exist for auth to work.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
