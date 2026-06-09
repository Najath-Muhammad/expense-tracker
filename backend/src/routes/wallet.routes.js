const { Router } = require('express');
const { body, param } = require('express-validator');
const container = require('../di/container');
const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router();
const ctrl = container.walletController;

const walletRules = [
  body('name').trim().notEmpty().withMessage('Wallet name is required').isLength({ max: 50 }),
  body('type').optional().isIn(['personal', 'family', 'friends', 'office', 'travel', 'savings', 'custom']),
  body('monthlyBudget').optional().isNumeric().withMessage('Monthly budget must be a number'),
];

const joinRules = [
  body('inviteCode').trim().notEmpty().withMessage('Invite code is required'),
];

const roleRules = [
  body('role').isIn(['owner', 'admin', 'member']).withMessage('Invalid role'),
];

// All wallet routes require authentication
router.use(authenticate);

router.post('/', walletRules, validate, ctrl.createWallet);
router.get('/', ctrl.getWallets);
router.get('/:id', ctrl.getWallet);
router.patch('/:id', ctrl.updateWallet);
router.delete('/:id', ctrl.deleteWallet);

// Invite & join
router.post('/:id/invite', ctrl.generateInviteCode);
router.post('/join', joinRules, validate, ctrl.joinWallet);

// Members
router.delete('/:id/members/:memberId', ctrl.removeMember);
router.patch('/:id/members/:memberId/role', roleRules, validate, ctrl.updateMemberRole);
router.patch('/:id/transfer-ownership', ctrl.transferOwnership);

// Set active wallet
router.patch('/:id/set-active', ctrl.setActiveWallet);

module.exports = router;
