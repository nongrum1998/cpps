import { formatPassword } from '@lib/encryption';
import { passwordValidation } from '@validation/common';
import { z } from 'zod';
import { ppoNoValidation } from './common';

export const LoginSchema = z.object({
  username: ppoNoValidation('Username'),
  password: passwordValidation.transform((v) => formatPassword(v)),
});

export type LoginInput = z.infer<typeof LoginSchema>;
