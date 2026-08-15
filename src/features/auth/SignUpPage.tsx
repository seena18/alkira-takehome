import { Link } from 'react-router-dom'

/**
 * A navigable stub, unstyled until the visual pass. Registration is out of
 * scope for this build, so instead of a dead form the screen offers the two
 * demo accounts — the thing a visitor without an account actually needs here.
 * The credentials are hardcoded text on purpose: rendering them from the mock
 * store would couple a public screen to the credential module.
 */
export default function SignUpPage() {
  return (
    <main>
      <h1>Create an account</h1>
      <p>Registration is not part of this demo build. Use one of the demo accounts instead:</p>

      <ul>
        <li>
          <strong>viewer@example.com</strong> — read-only access
        </li>
        <li>
          <strong>editor@example.com</strong> — read/write access
        </li>
      </ul>
      <p>
        Password for both: <strong>Alkira123!</strong>
      </p>

      <p>
        <Link to="/login">Back to sign in</Link>
      </p>
    </main>
  )
}
