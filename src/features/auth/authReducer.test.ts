import { authReducer, initialAuthState } from './authReducer.ts'
import type { AuthState } from './authReducer.ts'
import type { User } from '../../lib/types.ts'

const user: User = { email: 'e@example.com', name: 'E', role: 'editor' }
const other: User = { email: 'v@example.com', name: 'V', role: 'viewer' }

const anonymous: AuthState = initialAuthState
const awaitingMfa: AuthState = { status: 'awaitingMfa', user }
const authenticated: AuthState = { status: 'authenticated', user }

describe('authReducer', () => {
  it('moves anonymous to awaitingMfa when the password is verified', () => {
    expect(authReducer(anonymous, { type: 'PASSWORD_VERIFIED', user })).toEqual(awaitingMfa)
  })

  it('moves awaitingMfa to authenticated when MFA is verified', () => {
    expect(authReducer(awaitingMfa, { type: 'MFA_VERIFIED' })).toEqual(authenticated)
  })

  // The transition the machine exists to forbid: there is no action sequence
  // that reaches 'authenticated' without passing the password step first.
  it('ignores MFA_VERIFIED while anonymous', () => {
    expect(authReducer(anonymous, { type: 'MFA_VERIFIED' })).toEqual(anonymous)
  })

  it('ignores a repeated MFA_VERIFIED once authenticated', () => {
    expect(authReducer(authenticated, { type: 'MFA_VERIFIED' })).toEqual(authenticated)
  })

  it.each([
    ['anonymous', anonymous],
    ['awaitingMfa', awaitingMfa],
    ['authenticated', authenticated],
  ] as const)('LOGOUT from %s returns to anonymous', (_name, state) => {
    expect(authReducer(state, { type: 'LOGOUT' })).toEqual(anonymous)
  })

  // Logging in again — even while authenticated — starts a fresh pending
  // session that must pass MFA again; it never carries the old session over.
  it('re-verifying a password restarts the pending session', () => {
    expect(authReducer(authenticated, { type: 'PASSWORD_VERIFIED', user: other })).toEqual({
      status: 'awaitingMfa',
      user: other,
    })
  })
})
