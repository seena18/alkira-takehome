import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './features/auth/LoginPage.tsx'
import MfaPage from './features/auth/MfaPage.tsx'
import ProtectedRoute from './features/auth/ProtectedRoute.tsx'
import SignUpPage from './features/auth/SignUpPage.tsx'
import ConnectorsPage from './features/connectors/ConnectorsPage.tsx'

/**
 * The routing table is the map of the app. Every state of the auth flow has its
 * own URL — including the MFA step — so each is independently linkable,
 * testable, and guardable. Everything nested under <ProtectedRoute> requires a
 * finished login by position; this table is the one place to audit what is
 * protected.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/mfa" element={<MfaPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/connectors" element={<ConnectorsPage />} />
      </Route>

      {/* The only public surface is auth, so an unknown URL is best answered
          with the sign-in screen. `replace` keeps it out of the back button. */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
