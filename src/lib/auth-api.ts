import type { User } from './types.ts'

/**
 * The mock backend. This file is the app's server: every function here is the
 * seam where a real HTTPS call would go, and nothing outside it may touch
 * credentials. Swapping mock for real means changing this file only.
 *
 * The record type extends User with a password precisely so the public User
 * type cannot carry one, and USERS is not exported — the only way past this
 * file is verifyCredentials, which strips the password before returning.
 *
 * Plaintext passwords are acceptable only in a development fixture like this
 * one; a real store holds salted hashes on a server.
 */
type MockUserRecord = User & { password: string }

const USERS: MockUserRecord[] = [
  {
    email: 'viewer@example.com',
    password: 'Alkira123!',
    name: 'Priya Patel',
    role: 'viewer',
  },
  {
    email: 'editor@example.com',
    password: 'Alkira123!',
    name: 'Alex Rivera',
    role: 'editor',
  },
]

/**
 * Small artificial latency so pending states in the UI are real, and so the
 * signature already has the async shape a real network call would have —
 * swapping this mock for a fetch changes no caller. Zero under test so the
 * suite stays fast.
 */
const LATENCY_MS = import.meta.env.MODE === 'test' ? 0 : 400
const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

/**
 * The one MFA code the mock backend accepts. Exported so the on-screen demo
 * hint renders the same constant the check uses — they cannot drift apart.
 */
export const DEMO_OTP_CODE = '123456'

/**
 * Second factor of the mock flow. A real implementation would rate-limit,
 * expire the code, and tie it to the pending session server-side; here the
 * seam is what matters — swapping this for a real call changes no caller.
 */
export async function verifyMfaCode(code: string): Promise<boolean> {
  await delay()
  return code === DEMO_OTP_CODE
}

/**
 * Checks credentials against the store. Email matching is case-insensitive and
 * whitespace-tolerant; password matching is exact. Resolves with the public
 * User (no password) or null — it never throws, so callers have exactly two
 * cases to handle.
 */
export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  await delay()
  // Both sides are normalized so the match cannot depend on how a record was
  // typed into the store above.
  const needle = email.trim().toLowerCase()
  const record = USERS.find((u) => u.email.toLowerCase() === needle)
  if (!record || record.password !== password) return null
  const { password: _stripped, ...user } = record
  return user
}
