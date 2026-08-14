import { loginSchema } from './loginSchema.ts'

function messagesOf(result: ReturnType<typeof loginSchema.safeParse>) {
  return result.success ? [] : result.error.issues.map((issue) => issue.message)
}

describe('loginSchema', () => {
  it('accepts valid input and normalizes the email like the auth API does', () => {
    const result = loginSchema.safeParse({
      email: '  Viewer@Example.COM  ',
      password: 'Alkira123!',
    })
    expect(result.success).toBe(true)
    expect(result.data?.email).toBe('viewer@example.com')
  })

  it('requires an email', () => {
    const result = loginSchema.safeParse({ email: '   ', password: 'x' })
    expect(messagesOf(result)).toContain('Email is required')
  })

  it('rejects a malformed email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'x' })
    expect(messagesOf(result)).toContain('Enter a valid email address')
  })

  it('requires a password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '' })
    expect(messagesOf(result)).toContain('Password is required')
  })

  // Pins the presence-not-policy decision: any non-empty password reaches the
  // backend, which is the only judge of whether it is correct.
  it('imposes no composition rules on the password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'x' })
    expect(result.success).toBe(true)
  })
})
