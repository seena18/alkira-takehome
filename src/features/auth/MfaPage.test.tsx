import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App.tsx'
import { AuthProvider } from './AuthProvider.tsx'
import type { AuthState } from './authReducer.ts'
import type { User } from '../../lib/types.ts'

const viewer: User = { email: 'viewer@example.com', name: 'Priya Patel', role: 'viewer' }

/** Mounts the app at /mfa with auth seeded to any point in the flow. */
function renderMfaAs(state?: AuthState) {
  return render(
    <AuthProvider initialState={state}>
      <MemoryRouter initialEntries={['/mfa']}>
        <App />
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('MfaPage', () => {
  it('redirects an anonymous visitor to login — nothing to verify', () => {
    renderMfaAs()
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('redirects an already-authenticated visitor forward to connectors', () => {
    renderMfaAs({ status: 'authenticated', user: viewer })
    expect(screen.getByRole('heading', { name: /connectors/i })).toBeInTheDocument()
  })

  it('shows the form, the pending email, and the demo hint while awaiting MFA', () => {
    renderMfaAs({ status: 'awaitingMfa', user: viewer })
    expect(screen.getByRole('heading', { name: /two-factor/i })).toBeInTheDocument()
    expect(screen.getByText('viewer@example.com')).toBeInTheDocument()
    expect(screen.getByText(/your code is 123456/i)).toBeInTheDocument()
  })

  it('rejects a malformed code without calling the backend', async () => {
    const user = userEvent.setup()
    renderMfaAs({ status: 'awaitingMfa', user: viewer })

    await user.type(screen.getByLabelText(/verification code/i), '12')
    await user.click(screen.getByRole('button', { name: /^verify$/i }))

    expect(await screen.findByText('Enter the 6-digit code')).toBeInTheDocument()
  })

  it('shows an alert for a wrong code and stays on the screen', async () => {
    const user = userEvent.setup()
    renderMfaAs({ status: 'awaitingMfa', user: viewer })

    await user.type(screen.getByLabelText(/verification code/i), '654321')
    await user.click(screen.getByRole('button', { name: /^verify$/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Incorrect code, try again')
    expect(screen.getByRole('heading', { name: /two-factor/i })).toBeInTheDocument()
  })

  it('moves to connectors on the correct code', async () => {
    const user = userEvent.setup()
    renderMfaAs({ status: 'awaitingMfa', user: viewer })

    await user.type(screen.getByLabelText(/verification code/i), '123456')
    await user.click(screen.getByRole('button', { name: /^verify$/i }))

    expect(await screen.findByRole('heading', { name: /connectors/i })).toBeInTheDocument()
  })

  it('abandons the pending session via "use a different account"', async () => {
    const user = userEvent.setup()
    renderMfaAs({ status: 'awaitingMfa', user: viewer })

    await user.click(screen.getByRole('button', { name: /use a different account/i }))

    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })
})
