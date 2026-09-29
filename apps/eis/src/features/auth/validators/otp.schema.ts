import { otpValidiation, phoneValidation } from '@validators/common';
import { z } from 'zod';

export const OTPSchema = z.object({
  phone_no: phoneValidation,
  otp: otpValidiation,
});
