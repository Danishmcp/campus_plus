import { describe, it, expect } from 'vitest';
import { createClubSchema, updateClubSchema, addMemberSchema } from '../src/validators/club.validator.js';

describe('Club Validators', () => {
  it('should validate valid club creation input', () => {
    const input = {
      name: 'Artificial Intelligence Society',
      description: 'A club dedicated to learning machine learning algorithms and neural networks.',
      category: 'Technology',
    };
    const res = createClubSchema.safeParse(input);
    expect(res.success).toBe(true);
  });

  it('should reject club creation with short description', () => {
    const input = {
      name: 'AI Society',
      description: 'Too short',
      category: 'Technology',
    };
    const res = createClubSchema.safeParse(input);
    expect(res.success).toBe(false);
  });

  it('should validate member addition with role', () => {
    const input = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      role: 'LEAD',
    };
    const res = addMemberSchema.safeParse(input);
    expect(res.success).toBe(true);
  });
});
