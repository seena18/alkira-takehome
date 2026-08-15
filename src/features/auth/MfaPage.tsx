import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout.tsx'
import { DEMO_OTP_CODE, verifyMfaCode } from '../../lib/auth-api.ts'
import { useAuth } from './authContext.ts'
import { mfaSchema } from './mfaSchema.ts'
import type { MfaInput } from './mfaSchema.ts'

/**
 * The screen defends itself from both directions: anonymous visitors have
 * nothing to verify and go back to login; authenticated ones are already done
 * and go forward. Only the awaitingMfa state renders a form.
 *
 * One OTP-styled input, not six boxes (see DECISIONS.md): the six-box UI is a
 * focus-management minefield for visual payoff, and one field with
 * autoComplete="one-time-code" is what browsers autofill real codes into.
 */
export default function MfaPage() {
  const { state, dispatch } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MfaInput>({
    resolver: zodResolver(mfaSchema),
    mode: 'onTouched',
    defaultValues: { code: '' },
  })

  if (state.status === 'anonymous') return <Navigate to="/login" replace />
  if (state.status === 'authenticated') return <Navigate to="/connectors" replace />

  async function onValid({ code }: MfaInput) {
    const ok = await verifyMfaCode(code)
    if (!ok) {
      setError('root', { message: 'Incorrect code, try again' })
      return
    }
    dispatch({ type: 'MFA_VERIFIED' })
    navigate('/connectors')
  }

  return (
    <AuthLayout
      title="Two-factor authentication"
      subtitle="Enter the 6-digit code from your authenticator app."
    >
      <p className="mb-4 text-sm text-muted">
        Verifying as <strong className="font-medium text-ink">{state.user.email}</strong>
      </p>

      <div className="alert alert-info mb-5">Demo build: your code is {DEMO_OTP_CODE}</div>

      <form onSubmit={handleSubmit(onValid)} noValidate className="space-y-5">
        {errors.root && (
          <div role="alert" className="alert alert-error">
            {errors.root.message}
          </div>
        )}

        <div>
          <label htmlFor="code" className="field-label">
            Verification code
          </label>
          <input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="••••••"
            className="field-input h-[52px] text-center text-xl font-semibold tracking-[0.5em]"
            aria-invalid={errors.code ? true : undefined}
            aria-describedby={errors.code ? 'code-error' : undefined}
            {...register('code')}
          />
          {errors.code && (
            <p id="code-error" className="field-error">
              {errors.code.message}
            </p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
          {isSubmitting ? 'Verifying…' : 'Verify'}
        </button>
      </form>

      {/* Dispatching LOGOUT is enough: state returns to anonymous, and the
          redirect at the top of this component does the navigation. The router
          follows the state machine, never the other way around. */}
      <button
        type="button"
        onClick={() => dispatch({ type: 'LOGOUT' })}
        className="mt-4 text-sm font-medium text-brand hover:underline"
      >
        ← Use a different account
      </button>
    </AuthLayout>
  )
}
