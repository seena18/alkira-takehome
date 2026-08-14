import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './features/auth/LoginPage.tsx'
import MfaPage from './features/auth/MfaPage.tsx'
import SignUpPage from './features/auth/SignUpPage.tsx'
import ConnectorsPage from './features/connectors/ConnectorsPage.tsx'

/**
 * The routing table is the map of the app. Every state of the auth flow has its
 * own URL — including the MFA step — so each is independently linkable,
 * testable, and guardable.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/mfa" element={<MfaPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Deliberately unguarded until slice 5, where these move under a
          <ProtectedRoute> element. There is no auth state to guard on yet. */}
      <Route path="/connectors" element={<ConnectorsPage />} />

      {/* The only public surface is auth, so an unknown URL is best answered
          with the sign-in screen. `replace` keeps it out of the back button. */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
