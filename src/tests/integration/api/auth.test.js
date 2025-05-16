const request = require('supertest');
const app = require('../../../app');
const { User } = require('../../../models');
const { createTestUser, generateTestToken } = require('../../helpers');

describe('Authentication API', () => {
  beforeEach(async () => {
    await User.destroy({ where: {}, force: true });
  });

  describe('POST /api/users/register', () => {
    const validUser = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send(validUser);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(validUser.email);
      expect(res.body.data.password).toBeUndefined();
    });

    it('should not register user with existing email', async () => {
      await User.create(validUser);
      
      const res = await request(app)
        .post('/api/users/register')
        .send(validUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('email already exists');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.details).toHaveLength(4);
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      await createTestUser();
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.lastLoginAt).toBeDefined();
    });

    it('should not login with invalid password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Invalid email or password');
    });
  });

  describe('POST /api/users/password/reset-request', () => {
    beforeEach(async () => {
      await createTestUser();
    });

    it('should generate reset token for existing email', async () => {
      const res = await request(app)
        .post('/api/users/password/reset-request')
        .send({
          email: 'test@example.com'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const user = await User.findOne({ where: { email: 'test@example.com' } });
      expect(user.passwordResetToken).toBeDefined();
      expect(user.passwordResetExpires).toBeDefined();
    });

    it('should not reveal if email exists', async () => {
      const res = await request(app)
        .post('/api/users/password/reset-request')
        .send({
          email: 'nonexistent@example.com'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('If the email exists, a reset link will be sent');
    });
  });

  describe('POST /api/users/password/reset', () => {
    let user;
    let resetToken;

    beforeEach(async () => {
      user = await createTestUser();
      resetToken = user.generatePasswordResetToken();
      await user.save();
    });

    it('should reset password with valid token', async () => {
      const res = await request(app)
        .post('/api/users/password/reset')
        .send({
          token: resetToken,
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Should be able to login with new password
      const loginRes = await request(app)
        .post('/api/users/login')
        .send({
          email: user.email,
          password: 'newpassword123'
        });

      expect(loginRes.status).toBe(200);
    });

    it('should not reset password with invalid token', async () => {
      const res = await request(app)
        .post('/api/users/password/reset')
        .send({
          token: 'invalid-token',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Invalid or expired reset token');
    });

    it('should not reset password with expired token', async () => {
      const res = await request(app)
        .post('/api/users/password/reset')
        .send({
          token: 'expired-token',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Invalid or expired reset token');
    });
  });

  describe('Protected Routes', () => {
    let token;
    let user;

    beforeEach(async () => {
      user = await createTestUser('admin');
      token = generateTestToken(user);
    });

    it('should access protected route with valid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userId).toBe(user.userId);
    });

    it('should not access protected route without token', async () => {
      const res = await request(app)
        .get('/api/users/profile');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('No token provided');
    });

    it('should not access admin route with user role', async () => {
      const user = await createTestUser('user');
      const userToken = generateTestToken(user);
      
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Insufficient permissions');
    });
  });
}); 