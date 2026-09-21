import { ALLOW_REGEX } from '@utils/regex-patterns';
import { z } from 'zod';

export const ppoNoValidation = (message?: string) =>
  z
    .string(`${message || 'PPO No'} is Required`)
    .regex(ALLOW_REGEX.USERNAME, `Invalid ${message || 'PPO No'}`)
    .trim();
