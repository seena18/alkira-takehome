import type { Role, User } from './types.ts'

/**
 * Everything a user can be allowed to do, named as resource:action. Adding a
 * feature means adding capabilities here first — the vocabulary is the API.
 */
export type Capability = 'connector:view' | 'connector:edit' | 'connector:delete'

/**
 * The single place policy lives. `Record<Role, …>` means adding a Role without
 * deciding its permissions is a compile error, not a runtime surprise.
 */
const PERMISSIONS: Record<Role, ReadonlySet<Capability>> = {
  viewer: new Set<Capability>(['connector:view']),
  editor: new Set<Capability>(['connector:view', 'connector:edit', 'connector:delete']),
}

/**
 * The one question the UI is allowed to ask about authorization.
 *
 * Components state intent — can(user, 'connector:edit') — and never inspect
 * user.role directly, so policy stays in the table above instead of leaking
 * into markup one `role === 'editor'` at a time.
 */
export function can(user: User, capability: Capability): boolean {
  return PERMISSIONS[user.role].has(capability)
}
