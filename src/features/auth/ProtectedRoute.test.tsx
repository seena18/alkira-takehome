import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App.tsx'
import { AuthProvider } from './AuthProvider.tsx'
import type { AuthState } from './authReducer.ts'
import type { User } from '../../lib/types.ts'

const viewer: User = { email: 'viewer@example.com', name: 'Priya Patel', role: 'viewer' }

function renderConnectorsAs(state?: AuthState) {
  return render(
    <AuthProvider initialState={state}>
      <MemoryRouter initialEntries={['/connectors']}>
        <App />
      </MemoryRouter>
    </AuthProvider>,
  )
}

/**
 * One test per auth state — the guard's whole contract. The middle case is the
 * one a naive "is there a user?" guard gets wrong: awaitingMfa has a user, but
 * not a finished login.
 */
describe('ProtectedRoute', () => {
  it('sends an anonymous visitor to login', () => {
    renderConnectorsAs()
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('sends a half-authenticated visitor to /mfa to resume, not restart', () => {
    renderConnectorsAs({ status: 'awaitingMfa', user: viewer })
    expect(screen.getByRole('heading', { name: /two-factor/i })).toBeInTheDocument()
  })

  it('renders the protected screen once fully authenticated', () => {
    renderConnectorsAs({ status: 'authenticated', user: viewer })
    expect(screen.getByRole('heading', { name: /connectors/i })).toBeInTheDocument()
  })
})
