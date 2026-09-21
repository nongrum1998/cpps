import { z } from 'zod';
import { ppoNoValidation } from './common';
import { passwordValidation } from '@validation/common';
import { ALLOW_REGEX } from '@utils/regex-patterns';
import { formatPassword } from '@lib/encryption';

export const RegistrationStatusSchema = z.object({
  ppo_no: ppoNoValidation('PPO Number'),
});

export type RegistrationStatusInput = z.infer<typeof RegistrationStatusSchema>;

const dateOfBirthValidation = z
  .string('Date of Birth is Required')
  .min(10, 'Date of Birth should be 10 in length')
  .trim();

const bankAccountValidation = z
  .string('Account no is Required')
  .min(16, 'Account no should be 16 in length')
  .max(16, 'Account no should be not less then 16 in length')
  .regex(ALLOW_REGEX.NUMERIC_ONLY);

export const RegisterPersonalInfoSchema = z.object({
  dob: dateOfBirthValidation,
  bank_account_number: bankAccountValidation,
  organization: z
    .string('Organization is Required')
    .min(3, 'Invalid organization')
    .optional()
    .nullable(),
});

export type RegisterPersonalInfoInput = z.infer<typeof RegisterPersonalInfoSchema>;

export const RegisterPasswordSchema = z
  .object({
    password: passwordValidation,
    confirm_password: passwordValidation,
  })
  .superRefine(({ password, confirm_password }, ctx) => {
    if (password !== confirm_password) {
      ctx.addIssue({
        message: 'Passwords do not match',
        path: ['confirm_password'],
        code: 'custom',
      });
    }
  });

export type RegisterPasswordInput = z.infer<typeof RegisterPasswordSchema>;

export const RegisterPensionerSchema = z.object({
  ppo_no: ppoNoValidation('PPO No.'),
  dob: dateOfBirthValidation,
  password: passwordValidation.transform((v) => formatPassword(v)),
  bank_account_number: bankAccountValidation,
});

export type RegisterPensionerInput = z.infer<typeof RegisterPensionerSchema>;
