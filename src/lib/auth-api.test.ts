import { verifyCredentials, verifyMfaCode } from './auth-api.ts'

describe('verifyCredentials', () => {
  it('resolves the user for valid credentials', async () => {
    const user = await verifyCredentials('viewer@example.com', 'Alkira123!')
    expect(user).toMatchObject({ email: 'viewer@example.com', role: 'viewer' })
  })

  it('is case-insensitive and whitespace-tolerant on email', async () => {
    const user = await verifyCredentials('  Viewer@Example.COM ', 'Alkira123!')
    expect(user?.role).toBe('viewer')
  })

  it('rejects a wrong password', async () => {
    expect(await verifyCredentials('viewer@example.com', 'wrong')).toBeNull()
  })

  it('rejects an unknown email', async () => {
    expect(await verifyCredentials('ghost@example.com', 'Alkira123!')).toBeNull()
  })

  // The session object is what ends up in React state and devtools; this pins
  // the guarantee that a password can never travel with it.
  it('never leaks the password on the returned user', async () => {
    const user = await verifyCredentials('editor@example.com', 'Alkira123!')
    expect(user).not.toHaveProperty('password')
  })
})

describe('verifyMfaCode', () => {
  // The literal, not the exported constant: this test freezes the value the
  // README and demo hint promise.
  it('accepts the demo code', async () => {
    expect(await verifyMfaCode('123456')).toBe(true)
  })

  it('rejects any other code', async () => {
    expect(await verifyMfaCode('654321')).toBe(false)
  })
})
