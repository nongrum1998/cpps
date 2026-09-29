import { empCdValidation } from '@validators/common';
import { z } from 'zod';

export const ForgotPasswordSchema = z.object({
  emp_cd: empCdValidation,
});
