const request = require('supertest');
const app = require('../../app');
const { User } = require('../../models');
const { createTestUser, generateTestToken } = require('../../setup');

describe('Authentication', () => {
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
      await createTestUser();
      
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
      expect(res.body.error.details).toHaveLength(4); // email, password, firstName, lastName
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

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
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
      
      // Check that token was generated
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

  describe('Protected Routes', () => {
    let token;
    let user;

    beforeEach(async () => {
      user = await createTestUser();
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

    it('should not access protected route with invalid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Invalid token');
    });

    it('should not access admin route with user role', async () => {
      const userWithUserRole = await createTestUser('user');
      const userToken = generateTestToken(userWithUserRole);
      
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Insufficient permissions');
    });
  });
}); 