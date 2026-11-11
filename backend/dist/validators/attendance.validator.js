import { z } from 'zod';
export const scanQRSchema = z.object({
    eventId: z.string().uuid('Valid Event ID required'),
    qrToken: z.string().min(5, 'QR Token required'),
});
export const manualAttendanceSchema = z.object({
    eventId: z.string().uuid('Valid Event ID required'),
    studentIdentifier: z.string().min(2, 'Roll number or student email required'),
});
