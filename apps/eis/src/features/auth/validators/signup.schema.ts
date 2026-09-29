import { ONLY_LETTER_REGEX } from '@utils/constants/regex';
import { passwordValidation, phoneValidation } from '@validators/common';
import { z } from 'zod';

export const SignUpSchema = z
  .object({
    phone_no: phoneValidation,
    first_name: z
      .string('First name is required')
      .min(1, 'First name is required')
      .regex(ONLY_LETTER_REGEX, 'First name must only contain letters'),
    last_name: z
      .string('Last name is required')
      .min(1, 'Last name is required')
      .regex(ONLY_LETTER_REGEX, 'Last name must only contain letters'),
    password: passwordValidation,
    confirm_password: passwordValidation,
  })
  .superRefine(({ password, confirm_password }, ctx) => {
    if (password !== confirm_password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords does not match',
        path: ['confirm_password'],
      });
    }
  })
  .strict();
