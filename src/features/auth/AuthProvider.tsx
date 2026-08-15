import { useReducer } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './authContext.ts'
import { authReducer, initialAuthState } from './authReducer.ts'
import type { AuthState } from './authReducer.ts'

type AuthProviderProps = {
  children: ReactNode
  /**
   * Dependency injection for tests, which mount the tree mid-flow (e.g. already
   * awaiting MFA). The app itself never passes this — it always starts
   * anonymous.
   */
  initialState?: AuthState
}

/**
 * Holds the one auth reducer for the whole app. State is in memory only, so a
 * refresh returns to 'anonymous' — deliberate: a half-authenticated session
 * should not survive a reload, and persisting it client-side would only
 * imitate a guarantee this app cannot make. See DECISIONS.md.
 */
export function AuthProvider({ children, initialState = initialAuthState }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>
}
