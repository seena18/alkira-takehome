/**
 * Core auth vocabulary, shared by every feature.
 *
 * Role is a string union rather than an enum: it needs no runtime object, it
 * narrows naturally in conditionals, and a typo is a compile error anywhere a
 * Role is expected.
 */
export type Role = 'viewer' | 'editor'

/**
 * The user as the rest of the app sees it. Deliberately has no password field:
 * credentials exist only inside the mock backend (lib/auth-api.ts), so nothing
 * outside that file can ever hold — or accidentally render — a password.
 */
export type User = {
  email: string
  name: string
  role: Role
}
