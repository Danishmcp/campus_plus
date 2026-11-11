import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, changePasswordSchema } from '../src/validators/auth.validator.js';
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from '../src/utils/jwt.js';

describe('Auth Validators', () => {
  it('should validate valid registration input', () => {
    const valid = {
      name: 'John Doe',
      email: 'john@college.edu',
      password: 'StrongPassword123',
      department: 'Computer Science',
      rollNumber: 'CS202601',
    };
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email in registration', () => {
    const invalid = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'StrongPassword123',
    };
    const result = registerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject password less than 6 characters', () => {
    const invalid = {
      name: 'John Doe',
      email: 'john@college.edu',
      password: '123',
    };
    const result = registerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should validate valid login input', () => {
    const valid = {
      email: 'john@college.edu',
      password: 'Password123',
    };
    const result = loginSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});

describe('JWT Utility Functions', () => {
  it('should sign and verify access token correctly', () => {
    const payload = {
      id: 'user-uuid-1234',
      email: 'test@college.edu',
      role: 'STUDENT' as const,
      name: 'Test Student',
    };

    const token = signAccessToken(payload);
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.name).toBe(payload.name);
  });

  it('should sign and verify refresh token correctly', () => {
    const payload = { id: 'user-uuid-1234' };
    const token = signRefreshToken(payload);
    expect(typeof token).toBe('string');

    const decoded = verifyRefreshToken(token);
    expect(decoded.id).toBe(payload.id);
  });
});
