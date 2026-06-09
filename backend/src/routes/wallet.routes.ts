import { Router } from 'express';
import { body } from 'express-validator';
import asyncHandler from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import container from '../di/container';
import { ROUTE_PATHS } from '../constants';
import { WalletType, WalletRole } from '../enums';

const router = Router();

const createWalletRules = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('type').optional().isIn(Object.values(WalletType)).withMessage('Invalid wallet type'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
];

router.use(authenticate);

router.post(ROUTE_PATHS.ROOT, createWalletRules, validate, asyncHandler(container.walletController.createWallet.bind(container.walletController)) as any);
router.get(ROUTE_PATHS.ROOT, asyncHandler(container.walletController.getWallets.bind(container.walletController)) as any);

// Join wallet
router.post(ROUTE_PATHS.JOIN, [body('inviteCode').notEmpty().withMessage('Invite code is required')], validate, asyncHandler(container.walletController.joinWallet.bind(container.walletController)) as any);

router.get(ROUTE_PATHS.BY_ID, asyncHandler(container.walletController.getWallet.bind(container.walletController)) as any);
router.patch(ROUTE_PATHS.BY_ID, asyncHandler(container.walletController.updateWallet.bind(container.walletController)) as any);

// Invites & Members
router.post(ROUTE_PATHS.INVITE, asyncHandler(container.walletController.generateInvite.bind(container.walletController)) as any);
router.delete(ROUTE_PATHS.MEMBERS, asyncHandler(container.walletController.removeMember.bind(container.walletController)) as any);

export default router;
