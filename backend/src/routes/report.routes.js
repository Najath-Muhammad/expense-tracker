const { Router } = require('express');
const container = require('../di/container');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router({ mergeParams: true });
const ctrl = container.reportController;

router.use(authenticate);

router.get('/dashboard', ctrl.getDashboard);
router.get('/widget', ctrl.getWidgetData);
router.get('/monthly', ctrl.getMonthlyReport);
router.get('/yearly', ctrl.getYearlyReport);

module.exports = router;
