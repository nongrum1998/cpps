import { z } from 'zod';

export const TokenSchema = z.object({
  refresh_token: z.string('Refresh token is required').min(1, 'Refresh token is required'),
});
