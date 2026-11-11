import { describe, it, expect } from 'vitest';
import { createEventSchema, adminModerateEventSchema } from '../src/validators/event.validator.js';
import { createSignedQRToken, parseAndVerifyQRToken } from '../src/utils/qr.js';

describe('Event Validators', () => {
  it('should validate valid event creation input', () => {
    const now = new Date();
    const start = new Date(now.getTime() + 48 * 3600 * 1000).toISOString();
    const end = new Date(now.getTime() + 52 * 3600 * 1000).toISOString();
    const deadline = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();

    const input = {
      clubId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Full Stack Web Dev Workshop',
      description: 'Hands-on training building production grade React and Node applications.',
      category: 'Workshop',
      venue: 'Main Computer Lab 2',
      startDateTime: start,
      endDateTime: end,
      capacity: 60,
      registrationDeadline: deadline,
    };

    const res = createEventSchema.safeParse(input);
    expect(res.success).toBe(true);
  });

  it('should reject event where end time is before start time', () => {
    const now = new Date();
    const start = new Date(now.getTime() + 48 * 3600 * 1000).toISOString();
    const end = new Date(now.getTime() + 24 * 3600 * 1000).toISOString(); // before start!
    const deadline = new Date(now.getTime() + 12 * 3600 * 1000).toISOString();

    const input = {
      clubId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Invalid Event',
      description: 'Valid description for testing.',
      category: 'Seminar',
      venue: 'Auditorium',
      startDateTime: start,
      endDateTime: end,
      capacity: 50,
      registrationDeadline: deadline,
    };

    const res = createEventSchema.safeParse(input);
    expect(res.success).toBe(false);
  });

  it('should require a reason when admin rejects an event', () => {
    const invalidReject = {
      status: 'REJECTED',
    };
    const res = adminModerateEventSchema.safeParse(invalidReject);
    expect(res.success).toBe(false);

    const validReject = {
      status: 'REJECTED',
      rejectionReason: 'Venue not available on requested date.',
    };
    const res2 = adminModerateEventSchema.safeParse(validReject);
    expect(res2.success).toBe(true);
  });
});

describe('Cryptographic QR Ticket Generation & Validation', () => {
  it('should generate and successfully verify a signed QR ticket token', () => {
    const payload = {
      registrationId: 'reg-uuid-1111',
      eventId: 'event-uuid-2222',
      userId: 'user-uuid-3333',
    };

    const signedToken = createSignedQRToken(payload);
    expect(signedToken.startsWith('CPQR.')).toBe(true);

    const verified = parseAndVerifyQRToken(signedToken);
    expect(verified.isValid).toBe(true);
    expect(verified.registrationId).toBe(payload.registrationId);
    expect(verified.eventId).toBe(payload.eventId);
    expect(verified.userId).toBe(payload.userId);
  });

  it('should reject tampered QR tokens', () => {
    const payload = {
      registrationId: 'reg-uuid-1111',
      eventId: 'event-uuid-2222',
      userId: 'user-uuid-3333',
    };

    const signedToken = createSignedQRToken(payload);
    const tampered = signedToken.slice(0, -4) + 'abcd';

    const verified = parseAndVerifyQRToken(tampered);
    expect(verified.isValid).toBe(false);
  });
});
