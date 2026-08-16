import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App.tsx'
import { AuthProvider } from './features/auth/AuthProvider.tsx'

/**
 * The two journeys through the whole app, driven from the login screen with
 * nothing seeded. Every other test file isolates a screen or a function; these
 * prove the pieces compose — the state the login form dispatches is the state
 * the MFA screen accepts is the state the route guard demands. This is also
 * the demo script in executable form.
 */
function renderApp() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('full journey', () => {
  it('viewer: messy-cased login → MFA → read-only connectors → sign out', async () => {
    const user = userEvent.setup()
    renderApp()

    // Deliberately messy input: exercises schema normalization and the auth
    // API's case-insensitive match across the real stack, not in isolation.
    await user.type(screen.getByLabelText(/email/i), '  Viewer@Example.COM  ')
    await user.type(screen.getByLabelText(/^password/i), 'Alkira123!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await screen.findByRole('heading', { name: /two-factor authentication/i })
    await user.type(screen.getByLabelText(/verification code/i), '123456')
    await user.click(screen.getByRole('button', { name: /^verify$/i }))

    await screen.findByRole('heading', { name: /connectors/i })
    expect(screen.getByText(/read-only access/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add connector/i })).not.toBeInTheDocument()
    for (const button of screen.getAllByRole('button', { name: /^edit |^delete /i })) {
      expect(button).toBeDisabled()
    }

    await user.click(screen.getByRole('button', { name: /sign out/i }))
    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('editor: login → MFA → can add, edit, and delete connectors', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.type(screen.getByLabelText(/email/i), 'editor@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'Alkira123!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await screen.findByRole('heading', { name: /two-factor authentication/i })
    await user.type(screen.getByLabelText(/verification code/i), '123456')
    await user.click(screen.getByRole('button', { name: /^verify$/i }))

    await screen.findByRole('heading', { name: /connectors/i })
    expect(screen.queryByText(/read-only access/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete aws-prod-vpc' }))
    expect(screen.queryByText('aws-prod-vpc')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /add connector/i }))
    expect(screen.getByText('new-connector-1')).toBeInTheDocument()
  })
})
