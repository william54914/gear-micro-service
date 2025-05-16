const BaseController = require('./base.controller');
const schemas = require('../schemas/user.schema');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const Joi = require('joi');

class UserController extends BaseController {
  /**
   * Register new user
   */
  register = [
    this.validate(schemas.register, 'body'),
    this.asyncHandler(async (req, res) => {
      const user = await User.create(req.body);
      this.sendSuccess(res, user, 'User registered successfully');
    })
  ];

  /**
   * User login
   */
  login = [
    this.validate(schemas.login, 'body'),
    this.asyncHandler(async (req, res) => {
      const { email, password } = req.body;
      
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return this.sendError(res, 'Invalid email or password', 401);
      }

      const isValid = await user.comparePassword(password);
      if (!isValid) {
        return this.sendError(res, 'Invalid email or password', 401);
      }

      await user.updateLastLogin();

      const token = jwt.sign(
        { userId: user.userId, role: user.role },
        config.jwt.secret,
        { expiresIn: '24h' }
      );

      this.sendSuccess(res, { user, token });
    })
  ];

  /**
   * Get all users
   */
  getUsers = [
    this.validate(schemas.query, 'query'),
    this.asyncHandler(async (req, res) => {
      const users = await User.paginate(req.query);
      this.sendSuccess(res, users);
    })
  ];

  /**
   * Get user by ID
   */
  getUser = [
    this.validate(Joi.object({ id: Joi.number().required() }), 'params'),
    this.asyncHandler(async (req, res) => {
      const user = await User.findByIdOrFail(req.params.id);
      this.sendSuccess(res, user);
    })
  ];

  /**
   * Update user profile
   */
  updateProfile = [
    this.validate(schemas.updateProfile, 'body'),
    this.asyncHandler(async (req, res) => {
      const user = await User.findByIdOrFail(req.user.userId);
      await user.update(req.body);
      this.sendSuccess(res, user, 'Profile updated successfully');
    })
  ];

  /**
   * Update user password
   */
  updatePassword = [
    this.validate(schemas.updatePassword, 'body'),
    this.asyncHandler(async (req, res) => {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findByIdOrFail(req.user.userId);

      const isValid = await user.comparePassword(currentPassword);
      if (!isValid) {
        return this.sendError(res, 'Current password is incorrect', 401);
      }

      await user.update({ password: newPassword });
      this.sendSuccess(res, null, 'Password updated successfully');
    })
  ];

  /**
   * Request password reset
   */
  requestPasswordReset = [
    this.validate(schemas.resetRequest, 'body'),
    this.asyncHandler(async (req, res) => {
      const user = await User.findOne({ where: { email: req.body.email } });
      if (!user) {
        return this.sendError(res, 'If the email exists, a reset link will be sent', 200);
      }

      const token = user.generatePasswordResetToken();
      await user.save();

      // TODO: Send reset email
      
      this.sendSuccess(res, null, 'If the email exists, a reset link will be sent');
    })
  ];

  /**
   * Reset password
   */
  resetPassword = [
    this.validate(schemas.resetPassword, 'body'),
    this.asyncHandler(async (req, res) => {
      const { token, newPassword } = req.body;
      
      const user = await User.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { [Op.gt]: new Date() }
        }
      });

      if (!user) {
        return this.sendError(res, 'Invalid or expired reset token', 400);
      }

      user.password = newPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      this.sendSuccess(res, null, 'Password reset successfully');
    })
  ];

  /**
   * Admin update user
   */
  adminUpdateUser = [
    this.validate(Joi.object({ id: Joi.number().required() }), 'params'),
    this.validate(schemas.adminUpdateUser, 'body'),
    this.asyncHandler(async (req, res) => {
      const user = await User.findByIdOrFail(req.params.id);
      await user.update(req.body);
      this.sendSuccess(res, user, 'User updated successfully');
    })
  ];

  /**
   * Delete user
   */
  deleteUser = [
    this.validate(Joi.object({ id: Joi.number().required() }), 'params'),
    this.asyncHandler(async (req, res) => {
      const user = await User.findByIdOrFail(req.params.id);
      await user.destroy();
      this.sendSuccess(res, null, 'User deleted successfully');
    })
  ];
}

module.exports = new UserController(); 