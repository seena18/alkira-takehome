import type { User } from '../../lib/types.ts'

/**
 * Auth is a state machine with three states, and the type makes illegal ones
 * unrepresentable: `user` does not exist on 'anonymous', so code cannot read a
 * user it has not earned. Compare the alternative — `user: User | null` plus an
 * `mfaDone` boolean — which has four representable combinations, one of them
 * (no user, MFA "done") nonsense that every consumer would have to remember
 * never to create.
 */
export type AuthState =
  | { status: 'anonymous' }
  | { status: 'awaitingMfa'; user: User }
  | { status: 'authenticated'; user: User }

export type AuthAction =
  | { type: 'PASSWORD_VERIFIED'; user: User }
  | { type: 'MFA_VERIFIED' }
  | { type: 'LOGOUT' }

export const initialAuthState: AuthState = { status: 'anonymous' }

/**
 * Pure function, so the transition rules are testable without React. Illegal
 * transitions return the state unchanged rather than throwing: the reducer is
 * the last line of defence, and a defence that crashes the app is one nobody
 * will keep.
 */
export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'PASSWORD_VERIFIED':
      // Always starts a fresh pending session — including from 'authenticated',
      // where logging in again as someone else must re-run MFA from scratch.
      return { status: 'awaitingMfa', user: action.user }
    case 'MFA_VERIFIED':
      // The one transition worth defending: no sequence of actions reaches
      // 'authenticated' without passing through 'awaitingMfa' first.
      if (state.status !== 'awaitingMfa') return state
      return { status: 'authenticated', user: state.user }
    case 'LOGOUT':
      return initialAuthState
  }
}
