import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout.tsx'
import { verifyCredentials } from '../../lib/auth-api.ts'
import { useAuth } from './authContext.ts'
import { loginSchema } from './loginSchema.ts'
import type { LoginInput } from './loginSchema.ts'

/**
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
    <AuthLayout
      title="Sign in"
      subtitle="Welcome back — sign in to continue to the Alkira portal."
      footer={
        <>
          New to Alkira?{' '}
          <Link to="/signup" className="font-medium text-brand hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {/* noValidate: the browser's own email tooltip would otherwise fire
          before zod ever runs, showing two competing styles of error. */}
      <form onSubmit={handleSubmit(onValid)} noValidate className="space-y-5">
        {errors.root && (
          <div role="alert" className="alert alert-error">
            {errors.root.message}
          </div>
        )}

        <div>
          <label htmlFor="email" className="field-label">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="field-input"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" className="field-error">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="field-input"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          {errors.password && (
            <p id="password-error" className="field-error">
              {errors.password.message}
            </p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}
