import { empCdValidation, passwordValidation } from '@validators/common';
import { z } from 'zod';

/**
 * Zod validation schema for the login form.
 *
 * Validates an object with two fields:
 * - `emp_cd`: required, non-empty employee code. The value is uppercased via a
 *   transform, so `"emp001"` becomes `"EMP001"` on parse.
 * - `password`: required. In development builds (`NODE_ENV === 'development'`)
 *   only a non-empty value is enforced; in all other environments it must also
 *   satisfy {@link passwordValidation} (8–64 characters, at least one lowercase
 *   letter, uppercase letter, number, and special character).
 *
 * The schema is created with `.strict()`, so parsing an object that contains any
 * unknown field fails with a "Unrecognized key" error.
 *
 * Use it as the resolver for react-hook-form (`zodResolver(LoginSchema)`) and
 * infer the form value type with `z.infer<typeof LoginSchema>`.
 *
 * @example
 * const result = LoginSchema.safeParse({ emp_cd: 'emp123', password: 'Secret1!' });
 * // result.success === true, result.data.emp_cd === 'EMP123'
 */
export const LoginSchema = z
  .object({
    emp_cd: empCdValidation,
    password: passwordValidation,
  })
  .strict();
