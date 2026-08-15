import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App.tsx'
import { AuthProvider } from '../auth/AuthProvider.tsx'
import type { User } from '../../lib/types.ts'

const viewer: User = { email: 'viewer@example.com', name: 'Priya Patel', role: 'viewer' }
const editor: User = { email: 'editor@example.com', name: 'Alex Rivera', role: 'editor' }

function renderAs(user: User) {
  return render(
    <AuthProvider initialState={{ status: 'authenticated', user }}>
      <MemoryRouter initialEntries={['/connectors']}>
        <App />
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('ConnectorsPage', () => {
  it('shows who is signed in and their access level', () => {
    renderAs(viewer)
    expect(screen.getByText('viewer@example.com')).toBeInTheDocument()
    expect(screen.getByText(/read-only access/i)).toBeInTheDocument()
  })

  // The access-control contract as the user experiences it: same screen, same
  // buttons, different affordances.
  it('disables every edit and delete action for the read-only role', () => {
    renderAs(viewer)
    const actions = [
      ...screen.getAllByRole('button', { name: /^edit /i }),
      ...screen.getAllByRole('button', { name: /^delete /i }),
    ]
    expect(actions).not.toHaveLength(0)
    for (const action of actions) expect(action).toBeDisabled()
  })

  it('enables every edit and delete action for the read/write role', () => {
    renderAs(editor)
    const actions = [
      ...screen.getAllByRole('button', { name: /^edit |^delete /i }),
    ]
    expect(actions).not.toHaveLength(0)
    for (const action of actions) expect(action).toBeEnabled()
  })

  it('lets an editor delete a connector', async () => {
    const user = userEvent.setup()
    renderAs(editor)

    expect(screen.getByText('aws-prod-vpc')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Delete aws-prod-vpc' }))
    expect(screen.queryByText('aws-prod-vpc')).not.toBeInTheDocument()
  })

  it('lets an editor rename a connector inline', async () => {
    const user = userEvent.setup()
    renderAs(editor)

    await user.click(screen.getByRole('button', { name: 'Edit aws-dev-vpc' }))
    const input = screen.getByLabelText('New name for aws-dev-vpc')
    await user.clear(input)
    await user.type(input, 'aws-staging-vpc')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(screen.getByText('aws-staging-vpc')).toBeInTheDocument()
    expect(screen.queryByText('aws-dev-vpc')).not.toBeInTheDocument()
  })

  it('cancelling an edit changes nothing', async () => {
    const user = userEvent.setup()
    renderAs(editor)

    await user.click(screen.getByRole('button', { name: 'Edit aws-dev-vpc' }))
    const input = screen.getByLabelText('New name for aws-dev-vpc')
    await user.clear(input)
    await user.type(input, 'should-not-stick')
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.getByText('aws-dev-vpc')).toBeInTheDocument()
    expect(screen.queryByText('should-not-stick')).not.toBeInTheDocument()
  })

  it('signing out returns to the login screen', async () => {
    const user = userEvent.setup()
    renderAs(viewer)

    await user.click(screen.getByRole('button', { name: /sign out/i }))
    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })
})
