import { z } from 'zod';

export const registerEventSchema = z.object({
  eventId: z.string().uuid('Valid Event ID required'),
});

export type RegisterEventInput = z.infer<typeof registerEventSchema>;
