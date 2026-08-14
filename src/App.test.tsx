import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App.tsx'
import { AuthProvider } from './features/auth/AuthProvider.tsx'

/**
 * Mounting <App /> inside a MemoryRouter is only possible because the real
 * providers live in main.tsx. That is what lets these tests start at any URL
 * with a fresh, anonymous auth state.
 */
function renderAt(path: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('routing', () => {
  it('redirects the root path to the login screen', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('redirects an unknown path to the login screen', () => {
    renderAt('/nope')
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders the MFA screen at its own URL', () => {
    renderAt('/mfa')
    expect(
      screen.getByRole('heading', { name: /two-factor authentication/i }),
    ).toBeInTheDocument()
  })

  it('renders the sign-up screen at its own URL', () => {
    renderAt('/signup')
    expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument()
  })

  // Pins the current, deliberately unguarded behaviour. When <ProtectedRoute>
  // lands, this test must flip to "redirects to login" — making that change
  // visible in the diff is the point of having it now.
  it('renders the connectors screen at its own URL (unguarded for now)', () => {
    renderAt('/connectors')
    expect(screen.getByRole('heading', { name: /connectors/i })).toBeInTheDocument()
  })
})
