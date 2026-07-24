import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import authRouter from '../../../server/routes/auth';
import { authService } from '../../../server/services/AuthService';
import { loginRateLimiter } from '../../../server/middleware/authRateLimiter';

// Mock the authService dependency to prevent real DB/crypto calls
vi.mock('../../../server/services/AuthService', () => {
  const mockAuthService = {
    register: vi.fn(),
    getLoginPublicKey: vi.fn().mockReturnValue({ publicKey: 'fake-key', keyId: 'fake-id' }),
    decryptLoginPassword: vi.fn().mockImplementation((pwd) => pwd),
    login: vi.fn(),
    logout: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
  };
  return {
    authService: mockAuthService,
    default: mockAuthService,
  };
});

describe('Auth Route Rate Limiting - /api/auth/login', () => {
  let app: Express;
  let originalDateNow: typeof Date.now;
  let mockTime = 1718000000000; // Starting timestamp

  beforeEach(() => {
    // Increment mockTime by 1 day for each test to completely reset all rate limits
    mockTime += 24 * 60 * 60 * 1000;
    originalDateNow = Date.now;
    Date.now = () => mockTime;

    // Reset rate limiter for the test client IP
    loginRateLimiter.resetKey('::ffff:127.0.0.1');
    loginRateLimiter.resetKey('127.0.0.1');

    // Reset mock calls and implementations
    vi.clearAllMocks();

    // Create a fresh express app and mount authRouter
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRouter);
  });

  afterEach(() => {
    // Restore original Date.now
    Date.now = originalDateNow;
  });

  it('should allow up to 60 successful login requests within 1 second and block the 61st request with 429', async () => {
    // Mock successful login response
    vi.mocked(authService.login).mockResolvedValue({ success: true, token: 'fake-jwt-token' });

    // Send 60 successful login requests
    for (let i = 0; i < 60; i++) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'success@example.com', password: 'Password123' });
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, token: 'fake-jwt-token' });
    }

    // The 61st login request should be blocked and return 429
    const blockedRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'success@example.com', password: 'Password123' });

    expect(blockedRes.status).toBe(429);
    expect(blockedRes.body).toMatchObject({
      success: false,
      error: 'Too many requests',
      message: 'Please try again later',
    });
  });

  it('should allow up to 60 failed login requests within 1 second and block the 61st request with 429', async () => {
    // Mock failed login response
    vi.mocked(authService.login).mockResolvedValue({ success: false, message: '用户名或密码错误' });

    // Send 60 failed login requests
    for (let i = 0; i < 60; i++) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'fail@example.com', password: 'WrongPassword' });
      
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ success: false, message: '用户名或密码错误' });
    }

    // The 61st login request should be blocked and return 429
    const blockedRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fail@example.com', password: 'WrongPassword' });

    expect(blockedRes.status).toBe(429);
    expect(blockedRes.body).toMatchObject({
      success: false,
      error: 'Too many requests',
      message: 'Please try again later',
    });
  });

  it('should count both successful and failed logins towards the rate limit threshold and block the 61st request', async () => {
    // Mock login to succeed or fail based on email
    vi.mocked(authService.login).mockImplementation(async (email) => {
      if (email === 'success@example.com') {
        return { success: true, token: 'fake-jwt' };
      }
      return { success: false, message: '用户名或密码错误' };
    });

    // Send 30 successful and 30 failed logins alternately (total 60)
    for (let i = 0; i < 30; i++) {
      const successRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'success@example.com', password: 'Password123' });
      expect(successRes.status).toBe(200);

      const failRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'fail@example.com', password: 'WrongPassword' });
      expect(failRes.status).toBe(401);
    }

    // The 61st request should be blocked and return 429
    const blockedRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'success@example.com', password: 'Password123' });

    expect(blockedRes.status).toBe(429);
    expect(blockedRes.body).toMatchObject({
      success: false,
      error: 'Too many requests',
      message: 'Please try again later',
    });
  });
});
