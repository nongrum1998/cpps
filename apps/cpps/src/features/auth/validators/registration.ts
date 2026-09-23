import { z } from 'zod';
import { ppoNoValidation } from './common';
import { passwordValidation } from '@validation/common';
import { ZodIssueCode } from 'zod/v3';

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
  .min(4, 'Account Number should be atleast 4 in length');

export const RegisterSchema = z
  .object({
    ppo_no: ppoNoValidation('PPO Number').optional(),
    dob: dateOfBirthValidation,
    bank_accno: bankAccountValidation,
    password: passwordValidation,
    confirm_password: passwordValidation,
    image: z.string('Image is Required').optional(),
  })
  .superRefine(({ confirm_password, password }, ctx) => {
    if (password !== confirm_password) {
      return ctx.addIssue({
        code: ZodIssueCode.custom,
        path: ['confirm_password'],
        message: 'Password did not match',
      });
    }
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;
