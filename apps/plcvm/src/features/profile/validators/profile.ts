import { z } from 'zod';

/**
 * Zod schema for validating the profile update form.
 *
 * Validates the user-editable fields of a profile: `name` (1–120 chars) and
 * `username` (1–50 chars, only letters, numbers, dots, underscores, hyphens).
 */
export const ProfileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120, 'Name must be 120 characters or less'),
  organization: z
    .string('organization is required')
    .min(3, 'Organization should be atleast 3 in length'),
  username: z
    .string()
    .min(1, 'Username is required')
    .max(50, 'Username must be 50 characters or less')
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      'Username may only contain letters, numbers, dots, underscores, and hyphens'
    ),
});

/**
 * Inferred form/payload type for the profile update screen.
 *
 * Single source of truth derived from `ProfileUpdateSchema` — used both as the
 * react-hook-form generic and as the mutation payload type sent to the update
 * endpoint.
 */
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
