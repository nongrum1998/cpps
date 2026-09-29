import {
  LOWERCASE_LETTER_REGEX,
  NUMBER_REGEX,
  SPECIAL_CHARACTER_REGEX,
  UPPERCASE_LETTER_REGEX,
} from '@utils/constants/regex';
import { z } from 'zod';

export const passwordValidation = z
  .string('Password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(64, 'Password must be less than 64 characters')
  .regex(LOWERCASE_LETTER_REGEX, 'Must contain a lowercase letter')
  .regex(UPPERCASE_LETTER_REGEX, 'Must contain an uppercase letter')
  .regex(NUMBER_REGEX, 'Must contain a number')
  .regex(SPECIAL_CHARACTER_REGEX, 'Must contain a special character');
