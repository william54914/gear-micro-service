const { sequelize } = require('../../setup');
const User = require('../../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../../config/env');

describe('User Model', () => {
  beforeEach(async () => {
    await User.destroy({ where: {}, force: true });
  });

  describe('Validation', () => {
    it('should create a valid user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'user'
      };

      const user = await User.create(userData);
      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.role).toBe(userData.role);
    });

    it('should hash password before save', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = await User.create(userData);
      expect(user.password).not.toBe(userData.password);
      expect(await bcrypt.compare(userData.password, user.password)).toBe(true);
    });

    it('should validate required fields', async () => {
      const invalidUser = {};

      await expect(User.create(invalidUser)).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const invalidEmail = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      await expect(User.create(invalidEmail)).rejects.toThrow();
    });

    it('should validate password length', async () => {
      const shortPassword = {
        email: 'test@example.com',
        password: '12345', // too short
        firstName: 'Test',
        lastName: 'User'
      };

      await expect(User.create(shortPassword)).rejects.toThrow();
    });

    it('should validate role values', async () => {
      const invalidRole = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'invalid-role'
      };

      await expect(User.create(invalidRole)).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'user'
      });
    });

    it('should compare password correctly', async () => {
      expect(await user.comparePassword('password123')).toBe(true);
      expect(await user.comparePassword('wrongpassword')).toBe(false);
    });

    it('should generate valid password reset token', async () => {
      const token = user.generatePasswordResetToken();
      expect(token).toBeDefined();
      expect(user.passwordResetToken).toBeDefined();
      expect(user.passwordResetExpires).toBeDefined();
      expect(user.passwordResetExpires > new Date()).toBe(true);
    });

    it('should update last login timestamp', async () => {
      await user.updateLastLogin();
      expect(user.lastLoginAt).toBeDefined();
      expect(user.lastLoginAt instanceof Date).toBe(true);
    });

    it('should check role correctly', () => {
      expect(user.hasRole('user')).toBe(true);
      expect(user.hasRole('admin')).toBe(false);
      expect(user.hasRole(['admin', 'user'])).toBe(true);
      expect(user.hasRole(['admin', 'manager'])).toBe(false);
    });

    it('should get full name', () => {
      expect(user.getFullName()).toBe('Test User');
    });

    it('should remove sensitive data in toJSON', () => {
      const json = user.toJSON();
      expect(json.password).toBeUndefined();
      expect(json.passwordResetToken).toBeUndefined();
      expect(json.passwordResetExpires).toBeUndefined();
    });
  });

  describe('Password Updates', () => {
    it('should hash password on update', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });

      const newPassword = 'newpassword123';
      await user.update({ password: newPassword });

      expect(user.password).not.toBe(newPassword);
      expect(await bcrypt.compare(newPassword, user.password)).toBe(true);
    });

    it('should not hash password if not changed', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });

      const originalHash = user.password;
      await user.update({ firstName: 'Updated' });

      expect(user.password).toBe(originalHash);
    });
  });
}); 