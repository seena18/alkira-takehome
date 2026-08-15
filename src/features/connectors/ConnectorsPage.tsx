import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../../features/auth/authContext.ts'
import { can } from '../../lib/permissions.ts'
import { SEED_CONNECTORS } from './connectors.ts'

/**
 * The protected screen. Unstyled until the visual pass.
 *
 * Authorization here asks capabilities, never roles: `can(user, …)` in exactly
 * two places, and the access badge is derived from the same answer. If policy
 * changes in lib/permissions.ts, this file is already correct.
 *
 * Edit actions are disabled for read-only users, not hidden: the capability
 * exists and the role lacks it, and the difference between the two roles
 * should be visible. Hiding is the right call for features that should be
 * secret; a permission boundary users should understand is not one of those.
 */
export default function ConnectorsPage() {
  const { state, dispatch } = useAuth()
  const [connectors, setConnectors] = useState(SEED_CONNECTORS)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Unreachable behind <ProtectedRoute>; the narrow is for the compiler, and
  // rendering nothing beats pretending this state has a UI.
  if (state.status !== 'authenticated') return null
  const { user } = state

  const canEdit = can(user, 'connector:edit')
  const canDelete = can(user, 'connector:delete')

  function remove(id: string) {
    setConnectors((current) => current.filter((c) => c.id !== id))
  }

  function rename(id: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = new FormData(event.currentTarget).get('name')
    const name = typeof input === 'string' ? input.trim() : ''
    if (name) {
      setConnectors((current) => current.map((c) => (c.id === id ? { ...c, name } : c)))
    }
    setEditingId(null)
  }

  return (
    <main>
      <header>
        <h1>Connectors</h1>
        <p>
          Signed in as <strong>{user.email}</strong> ·{' '}
          {canEdit ? 'Read/write access' : 'Read-only access'}
        </p>
        <button type="button" onClick={() => dispatch({ type: 'LOGOUT' })}>
          Sign out
        </button>
      </header>

      <table>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Cloud</th>
            <th scope="col">Region</th>
            <th scope="col">CIDR</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {connectors.length === 0 && (
            <tr>
              <td colSpan={6}>No connectors.</td>
            </tr>
          )}
          {connectors.map((c) => (
            <tr key={c.id}>
              <th scope="row">
                {editingId === c.id ? (
                  <form onSubmit={(event) => rename(c.id, event)}>
                    <input
                      name="name"
                      defaultValue={c.name}
                      aria-label={`New name for ${c.name}`}
                      autoFocus
                    />
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  c.name
                )}
              </th>
              <td>{c.cloud}</td>
              <td>{c.region}</td>
              <td>{c.cidr}</td>
              <td>{c.status}</td>
              <td>
                <button
                  type="button"
                  disabled={!canEdit}
                  aria-label={`Edit ${c.name}`}
                  onClick={() => setEditingId(c.id)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={!canDelete}
                  aria-label={`Delete ${c.name}`}
                  onClick={() => remove(c.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
