import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

/**
 * The router lives here, not in <App />, so that <App /> can be mounted inside a
 * <MemoryRouter> in tests and driven by URL. A component can only sit inside one
 * router, so whichever file owns <BrowserRouter> is the file tests cannot reuse.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
