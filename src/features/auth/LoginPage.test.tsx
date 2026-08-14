import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App.tsx'
import { AuthProvider } from './AuthProvider.tsx'

/**
 * Mounted through <App /> rather than <LoginPage /> alone, so success can be
 * asserted the way a user sees it: the URL moves on and the MFA screen renders.
 */
function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('LoginPage', () => {
  it('shows both required errors after submitting empty fields', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('stays silent while typing and validates when the field is left', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'not-an-email')
    expect(screen.queryByText('Enter a valid email address')).not.toBeInTheDocument()

    await user.tab()
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()
  })

  it('clears the error as soon as the field is fixed, without re-blurring', async () => {
    const user = userEvent.setup()
    renderLogin()

    const email = screen.getByLabelText(/email/i)
    await user.type(email, 'not-an-email')
    await user.tab()
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()

    await user.type(email, '@example.com')
    expect(screen.queryByText('Enter a valid email address')).not.toBeInTheDocument()
  })

  it('announces one generic message for wrong credentials', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'viewer@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Invalid email or password')
  })

  it('moves to the MFA screen on valid credentials', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'viewer@example.com')
    await user.type(screen.getByLabelText(/password/i), 'Alkira123!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(
      await screen.findByRole('heading', { name: /two-factor authentication/i }),
    ).toBeInTheDocument()
  })
})
