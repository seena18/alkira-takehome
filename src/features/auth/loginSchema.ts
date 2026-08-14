import { z } from 'zod'

/**
 * The schema is the single source of truth for the login form: the validation
 * rules and the TypeScript type both come from it, so they cannot drift.
 *
 * Email is normalized (trim, lowercase) exactly the way the auth API normalizes
 * it, so what the form submits is what the backend compares.
 *
 * Password has no length or composition rule on purpose: a login form validates
 * presence, not policy. Whether the password is correct is the server's
 * question; composition rules belong to registration, and enforcing them here
 * would reject legacy passwords and advertise the expected password shape.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .pipe(z.email('Enter a valid email address')),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>
