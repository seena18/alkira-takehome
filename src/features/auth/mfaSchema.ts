import { z } from 'zod'

/**
 * Same idea as loginSchema: the rules and the type come from one place. The
 * format check runs client-side because "that is not a 6-digit code" needs no
 * round trip; whether it is the *right* code is the backend's question.
 */
export const mfaSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Code is required')
    .regex(/^\d{6}$/, 'Enter the 6-digit code'),
})

export type MfaInput = z.infer<typeof mfaSchema>
