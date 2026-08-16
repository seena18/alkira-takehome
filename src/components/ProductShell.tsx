import type { ReactNode } from 'react'
import { LayoutGrid, LogOut, Network, Settings, ShieldCheck } from 'lucide-react'
import type { User } from '../lib/types.ts'

type ProductShellProps = {
  user: User
  /** Role presented as the header badge — derived from capabilities upstream. */
  accessLabel: string
  onSignOut: () => void
  children: ReactNode
}

/**
 * The protected-area chrome (spec §10–§12): navy icon rail, dense white
 * header, light workspace. Only "Resources" in the rail is a real
 * destination; the other items are disabled and say so — a rail of one icon
 * would not read as a product shell, but fake enabled links would be doors
 * painted on a wall.
 */
const RAIL_ITEMS = [
  { icon: LayoutGrid, label: 'Overview', active: false },
  { icon: Network, label: 'Resources', active: true },
  { icon: ShieldCheck, label: 'Policies', active: false },
  { icon: Settings, label: 'Settings', active: false },
]

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function ProductShell({ user, accessLabel, onSignOut, children }: ProductShellProps) {
  return (
    <div className="flex min-h-full">
      <nav
        aria-label="Primary"
        className="hidden w-[72px] shrink-0 flex-col items-center gap-1 bg-navy py-5 md:flex"
      >
        <p className="mb-5 text-2xl leading-none font-bold text-white" aria-hidden="true">
          a
        </p>
        {RAIL_ITEMS.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            type="button"
            disabled={!active}
            aria-current={active ? 'page' : undefined}
            title={active ? label : `${label} — not part of this demo`}
            className={
              active
                ? 'grid size-11 place-items-center rounded-[6px] bg-brand/20 text-white'
                : 'grid size-11 place-items-center rounded-[6px] text-white/55 disabled:cursor-default'
            }
          >
            <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
            <span className="sr-only">{label}</span>
          </button>
        ))}
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-surface px-6 max-md:px-5">
          <p className="text-sm font-semibold tracking-tight text-ink-strong">
            alkira <span className="font-normal text-subtle">· A Lumen Connect Solution</span>
          </p>

          <div className="flex items-center gap-3">
            <span className="badge bg-brand-soft text-brand">{accessLabel}</span>
            <span className="text-[13px] text-muted max-sm:hidden">{user.email}</span>
            <span
              className="grid size-8 place-items-center rounded-full bg-navy text-[11px] font-semibold text-white"
              title={user.name}
              aria-hidden="true"
            >
              {initialsOf(user.name)}
            </span>
            <button type="button" onClick={onSignOut} className="btn btn-secondary btn-sm">
              <LogOut size={14} aria-hidden="true" />
              Sign out
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-8 max-md:p-5">{children}</main>
      </div>
    </div>
  )
}
