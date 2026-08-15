import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { DEMO_OTP_CODE, verifyMfaCode } from '../../lib/auth-api.ts'
import { useAuth } from './authContext.ts'
import { mfaSchema } from './mfaSchema.ts'
import type { MfaInput } from './mfaSchema.ts'

/**
 * Unstyled on purpose — the visual pass is slice 7.
 *
 * The screen defends itself from both directions: anonymous visitors have
 * nothing to verify and go back to login; authenticated ones are already done
 * and go forward. Only the awaitingMfa state renders a form.
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
    <main>
      <h1>Two-factor authentication</h1>
      <p>
        Verifying as <strong>{state.user.email}</strong>
      </p>
      <p>Demo build: your code is {DEMO_OTP_CODE}</p>

      <form onSubmit={handleSubmit(onValid)} noValidate>
        {errors.root && <div role="alert">{errors.root.message}</div>}

        <div>
          <label htmlFor="code">Verification code</label>
          <input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            aria-invalid={errors.code ? true : undefined}
            aria-describedby={errors.code ? 'code-error' : undefined}
            {...register('code')}
          />
          {errors.code && <p id="code-error">{errors.code.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Verifying…' : 'Verify'}
        </button>
      </form>

      {/* Dispatching LOGOUT is enough: state returns to anonymous, and the
          redirect at the top of this component does the navigation. The router
          follows the state machine, never the other way around. */}
      <button type="button" onClick={() => dispatch({ type: 'LOGOUT' })}>
        Use a different account
      </button>
    </main>
  )
}
