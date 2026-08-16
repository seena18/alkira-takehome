import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import ProductShell from '../../components/ProductShell.tsx'
import { useAuth } from '../auth/authContext.ts'
import { can } from '../../lib/permissions.ts'
import { SEED_CONNECTORS } from './connectors.ts'
import type { ConnectorStatus } from './connectors.ts'

/**
 * Status is always a dot plus a label (spec §18) — never colour alone.
 */
const STATUS_META: Record<ConnectorStatus, { label: string; tone: string }> = {
  up: { label: 'Healthy', tone: 'text-success' },
  degraded: { label: 'Needs attention', tone: 'text-warning' },
  down: { label: 'Down', tone: 'text-danger' },
}

/**
 * The protected screen. Authorization asks capabilities, never roles: the
 * access badge, the banner, the hidden create button, and the disabled row
 * actions all derive from can(user, …) — if policy changes in
 * lib/permissions.ts, this file is already correct.
 *
 * Edit/Delete are disabled for read-only users, not hidden: that boundary is
 * meant to be understood. Creation is hidden, not disabled — the deliberate
 * exception, reasoned at the button itself.
 */
export default function ConnectorsPage() {
  const { state, dispatch } = useAuth()
  const [connectors, setConnectors] = useState(SEED_CONNECTORS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const nextId = useRef(1)

  // Unreachable behind <ProtectedRoute>; the narrow is for the compiler, and
  // rendering nothing beats pretending this state has a UI.
  if (state.status !== 'authenticated') return null
  const { user } = state

  const canCreate = can(user, 'connector:create')
  const canEdit = can(user, 'connector:edit')
  const canDelete = can(user, 'connector:delete')

  const healthy = connectors.filter((c) => c.status === 'up').length

  function add() {
    const n = nextId.current++
    setConnectors((current) => [
      ...current,
      {
        id: `new-${n}`,
        name: `new-connector-${n}`,
        cloud: 'AWS',
        region: 'us-west-2',
        cidr: `10.${100 + n}.0.0/16`,
        status: 'up',
      },
    ])
  }

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
    <ProductShell
      user={user}
      accessLabel={canEdit ? 'Editor' : 'Read only'}
      onSignOut={() => dispatch({ type: 'LOGOUT' })}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-9 font-semibold text-ink-strong">Connectors</h1>
          <p className="mt-1 text-sm text-muted">
            View and manage cloud network connections across environments.
          </p>
        </div>

        {/* Hidden without the capability, not disabled — the one deliberate
            exception to the disable-don't-hide rule. Row actions communicate a
            boundary on things the viewer can see; creation is a workflow they
            do not have, and a permanently dead primary button would read as
            broken rather than gated. Both patterns shown on one screen. */}
        {canCreate && (
          <button type="button" onClick={add} className="btn btn-primary">
            <Plus size={16} aria-hidden="true" />
            Add connector
          </button>
        )}
      </div>

      {!canEdit && (
        <div className="alert alert-info mt-5">
          <p className="font-semibold text-ink">Read-only access</p>
          <p className="mt-0.5">
            You can view network resources, but your role does not allow changes.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-(--radius-card) border border-line bg-surface p-5 shadow-(--shadow-card)">
          <p className="text-xs font-medium text-muted">Connected</p>
          <p className="mt-1 text-2xl font-semibold text-ink-strong">{connectors.length}</p>
        </div>
        <div className="rounded-(--radius-card) border border-line bg-surface p-5 shadow-(--shadow-card)">
          <p className="text-xs font-medium text-muted">Healthy</p>
          <p className="mt-1 text-2xl font-semibold text-ink-strong">{healthy}</p>
        </div>
        <div className="rounded-(--radius-card) border border-line bg-surface p-5 shadow-(--shadow-card)">
          <p className="text-xs font-medium text-muted">Needs attention</p>
          <p className="mt-1 text-2xl font-semibold text-ink-strong">
            {connectors.length - healthy}
          </p>
        </div>
      </div>

      {/* overflow-x-auto keeps real table semantics on small screens at the
          cost of a sideways scroll; see DECISIONS.md for the trade-off. */}
      <div className="mt-6 overflow-x-auto rounded-(--radius-card) border border-line bg-surface shadow-(--shadow-card)">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="bg-surface-alt text-left text-xs font-medium text-muted">
              <th scope="col" className="px-4 py-3">Name</th>
              <th scope="col" className="px-4 py-3">Cloud</th>
              <th scope="col" className="px-4 py-3">Region</th>
              <th scope="col" className="px-4 py-3">CIDR</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {connectors.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No connectors.
                </td>
              </tr>
            )}
            {connectors.map((c) => {
              const status = STATUS_META[c.status]
              return (
                <tr
                  key={c.id}
                  className="h-[52px] border-t border-line-soft transition-colors hover:bg-row-hover"
                >
                  <th scope="row" className="px-4 text-left font-medium text-ink-strong">
                    {editingId === c.id ? (
                      <form
                        onSubmit={(event) => rename(c.id, event)}
                        className="flex items-center gap-2 py-2"
                      >
                        <input
                          name="name"
                          defaultValue={c.name}
                          aria-label={`New name for ${c.name}`}
                          autoFocus
                          className="field-input h-8 w-44 text-[13px]"
                        />
                        <button type="submit" className="btn btn-primary btn-sm">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="btn btn-secondary btn-sm"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      c.name
                    )}
                  </th>
                  <td className="px-4 text-ink">{c.cloud}</td>
                  <td className="px-4 text-ink">{c.region}</td>
                  <td className="px-4 font-mono text-[13px] text-muted">{c.cidr}</td>
                  <td className="px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${status.tone}`}
                    >
                      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!canEdit}
                        aria-label={`Edit ${c.name}`}
                        title={canEdit ? undefined : 'Your role has read-only access.'}
                        onClick={() => setEditingId(c.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Pencil size={14} aria-hidden="true" />
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={!canDelete}
                        aria-label={`Delete ${c.name}`}
                        title={canDelete ? undefined : 'Your role has read-only access.'}
                        onClick={() => remove(c.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </ProductShell>
  )
}
