import { Link } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout.tsx'

/**
 * A navigable stub. Registration is out of scope for this build, so instead of
 * a dead form the screen offers the two demo accounts — the thing a visitor
 * without an account actually needs here. The credentials are hardcoded text
 * on purpose: rendering them from the mock store would couple a public screen
 * to the credential module.
 */
export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create an account"
      subtitle="Registration is not part of this demo build — use a demo account instead."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <div className="alert alert-info">
        <p className="font-semibold text-ink">Demo accounts</p>
        <ul className="mt-2 space-y-1">
          <li>
            <strong className="font-medium">viewer@example.com</strong> — read-only access
          </li>
          <li>
            <strong className="font-medium">editor@example.com</strong> — read/write access
          </li>
        </ul>
        <p className="mt-2">
          Password for both: <strong className="font-medium">Alkira123!</strong>
        </p>
      </div>
    </AuthLayout>
  )
}
