import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './authContext.ts'

/**
 * Route-level guard for everything that requires a finished login. Routes
 * nested under this element (see App.tsx) are protected by position: adding a
 * page inside the wrapper is all it takes, there is no per-page check to
 * forget.
 *
 * The guard demands the full 'authenticated' state, not just "a user exists" —
 * awaitingMfa *has* a user, but one that has not finished proving who they are.
 * That distinction is the reason the state machine has three states.
 *
 * Half-done visitors resume at /mfa rather than restart at /login: their
 * password was correct, and throwing that away would punish the interruption.
 *
 * Not implemented on purpose: remembering the intended destination and
 * returning to it after login (the location-state "from" pattern). With exactly
 * one protected destination the behaviour would be identical to this hardcoded
 * flow; it becomes worth its complexity the moment a second protected page
 * exists.
 */
export default function ProtectedRoute() {
  const { state } = useAuth()
  if (state.status === 'anonymous') return <Navigate to="/login" replace />
  if (state.status === 'awaitingMfa') return <Navigate to="/mfa" replace />
  return <Outlet />
}
