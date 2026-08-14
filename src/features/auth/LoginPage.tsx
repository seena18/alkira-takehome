import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { verifyCredentials } from '../../lib/auth-api.ts'
import { useAuth } from './authContext.ts'
import { loginSchema } from './loginSchema.ts'
import type { LoginInput } from './loginSchema.ts'

/**
 * Unstyled on purpose for now — behaviour first, the visual pass comes next.
 *
 * Error timing: silent until a field is first left (mode 'onTouched'), then
 * re-validated per keystroke until fixed. Submit validates everything and
 * focuses the first invalid field (react-hook-form's default).
 */
export default function LoginPage() {
  const { dispatch } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  })

  async function onValid({ email, password }: LoginInput) {
    const user = await verifyCredentials(email, password)
    if (!user) {
      // Form-level, not field-level: the API deliberately does not say which
      // half was wrong, and neither do we. Root errors clear on the next
      // submit automatically.
      setError('root', { message: 'Invalid email or password' })
      return
    }
    dispatch({ type: 'PASSWORD_VERIFIED', user })
    navigate('/mfa')
  }

  return (
    <main>
      <h1>Sign in</h1>

      {/* noValidate: the browser's own email tooltip would otherwise fire
          before zod ever runs, showing two competing styles of error. */}
      <form onSubmit={handleSubmit(onValid)} noValidate>
        {errors.root && <div role="alert">{errors.root.message}</div>}

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && <p id="email-error">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          {errors.password && <p id="password-error">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p>
        No account? <Link to="/signup">Sign up</Link>
      </p>
    </main>
  )
}
