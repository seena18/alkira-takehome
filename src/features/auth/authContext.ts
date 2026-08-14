import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { AuthAction, AuthState } from './authReducer.ts'

/**
 * The context is deliberately dumb: state plus dispatch, nothing else. Async
 * work (calling the auth API, handling pending and failure) lives in the form
 * that owns that UX — putting async "action creators" here would add a layer
 * of indirection for three transitions.
 *
 * This file holds no components — the provider lives in AuthProvider.tsx — so
 * Vite's fast refresh can hot-swap component files cleanly.
 */
export type AuthContextValue = {
  state: AuthState
  dispatch: Dispatch<AuthAction>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * The only way to reach auth state. Throwing on a missing provider turns a
 * silent misconfiguration (context defaulting to null in every consumer) into
 * an immediate, named failure at the first render.
 */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
