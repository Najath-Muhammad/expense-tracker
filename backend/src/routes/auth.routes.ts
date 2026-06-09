import { Router } from 'express';
import { body } from 'express-validator';
import asyncHandler from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import container from '../di/container';
import { ROUTE_PATHS, REGEX } from '../constants';

const router = Router();

const registerRules = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password').matches(REGEX.PASSWORD).withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const passwordChangeRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').matches(REGEX.PASSWORD).withMessage('New password must be strong'),
];

router.post(ROUTE_PATHS.REGISTER, registerRules, validate, asyncHandler(container.authController.register.bind(container.authController)) as any);
router.post(ROUTE_PATHS.LOGIN, loginRules, validate, asyncHandler(container.authController.login.bind(container.authController)) as any);
router.post(ROUTE_PATHS.REFRESH_TOKEN, asyncHandler(container.authController.refreshToken.bind(container.authController)) as any);

router.use(authenticate);

router.post(ROUTE_PATHS.LOGOUT, asyncHandler(container.authController.logout.bind(container.authController)) as any);
router.get(ROUTE_PATHS.ME, asyncHandler(container.authController.getMe.bind(container.authController)) as any);
router.patch(ROUTE_PATHS.CHANGE_PASSWORD, passwordChangeRules, validate, asyncHandler(container.authController.changePassword.bind(container.authController)) as any);

export default router;
