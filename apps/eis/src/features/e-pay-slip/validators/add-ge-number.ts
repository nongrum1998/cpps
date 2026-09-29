import { ONLY_NUMBER_REGEX } from '@utils/constants';
import { z } from 'zod';

export const AddGeNumberSchema = z.object({
  ge_number: z
    .string('GE number is required')
    .regex(ONLY_NUMBER_REGEX, 'Please enter a valid GE number')
    .min(7, 'GE number must be at least 7 digits')
    .trim(),
});

export type AddGeNumberInput = z.infer<typeof AddGeNumberSchema>;
