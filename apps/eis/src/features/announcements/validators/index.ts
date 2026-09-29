import { z } from 'zod';

/**
 * Announcement Category
 */
export const AnnouncementCategorySchema = z.enum(['HOLIDAY', 'NOTICE', 'PERSONAL', 'GLOBAL']);

/**
 * Announcement Priority
 */
export const AnnouncementPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);

/**
 * Announcement Core Model
 */
export const AnnouncementSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: AnnouncementCategorySchema,
  priority: AnnouncementPrioritySchema,
  isRead: z.boolean(),
  createdAt: z.string(), // ISO String
  metadata: z.record(z.string(), z.string()).optional(),
});
