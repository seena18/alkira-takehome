import { can } from './permissions.ts'
import type { User } from './types.ts'

const viewer: User = { email: 'v@example.com', name: 'V', role: 'viewer' }
const editor: User = { email: 'e@example.com', name: 'E', role: 'editor' }

/**
 * This table is the access-control contract of the app, written out in full —
 * 2 roles × 3 capabilities. If policy changes, this test is the reviewable diff.
 */
describe('can', () => {
  it.each([
    ['connector:view', true],
    ['connector:edit', false],
    ['connector:delete', false],
  ] as const)('viewer %s -> %s', (capability, allowed) => {
    expect(can(viewer, capability)).toBe(allowed)
  })

  it.each([
    ['connector:view', true],
    ['connector:edit', true],
    ['connector:delete', true],
  ] as const)('editor %s -> %s', (capability, allowed) => {
    expect(can(editor, capability)).toBe(allowed)
  })
})
