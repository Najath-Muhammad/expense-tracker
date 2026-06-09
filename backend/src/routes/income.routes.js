const { Router } = require('express');
const { body } = require('express-validator');
const container = require('../di/container');
const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router({ mergeParams: true });
const ctrl = container.incomeController;

const incomeRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('amount').isNumeric({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('source').isIn([
    'salary', 'freelance', 'business', 'investment', 'rental', 'gift', 'bonus', 'others'
  ]).withMessage('Invalid income source'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
];

router.use(authenticate);

router.post('/', incomeRules, validate, ctrl.addIncome);
router.get('/', ctrl.getIncomes);
router.get('/balance', ctrl.getBalance);
router.get('/:id', ctrl.getIncome);
router.patch('/:id', ctrl.updateIncome);
router.delete('/:id', ctrl.deleteIncome);

module.exports = router;
