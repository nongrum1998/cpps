import { z } from 'zod';
import { otpValidiation, passwordValidation } from '@validators/common';

/**
 * Schema for Reset Password Step 1: New Password & Confirm Password
 */
export const ResetPasswordSchema = z
  .object({
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
  });

/**
 * Schema for Reset Password Step 2: OTP Verification
 */
export const ResetPasswordOtpSchema = z.object({
  otp: otpValidiation,
});

/**
 * Inferred types for the reset password forms
 */
export type ResetPasswordInputs = z.infer<typeof ResetPasswordSchema>;
export type ResetPasswordOtpInputs = z.infer<typeof ResetPasswordOtpSchema>;
