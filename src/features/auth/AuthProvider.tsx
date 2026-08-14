import { useReducer } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './authContext.ts'
import { authReducer, initialAuthState } from './authReducer.ts'

/**
 * Holds the one auth reducer for the whole app. State is in memory only, so a
 * refresh returns to 'anonymous' — deliberate: a half-authenticated session
 * should not survive a reload, and persisting it client-side would only
 * imitate a guarantee this app cannot make. See DECISIONS.md.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState)
  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>
}
