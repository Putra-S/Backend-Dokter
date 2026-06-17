const { Hono } = require('hono');
const auditTrail = require('../../middleware/auditTrail');
const asyncHandler = require('../../middleware/asyncHandler');
const router = new Hono();
const settingController = require('../../controllers/main/settingController');

router.get('/', asyncHandler(settingController.getSetting));
router.put('/', auditTrail('Setting'), asyncHandler(settingController.updateSetting));
router.get('/broadcast', asyncHandler(settingController.getBroadcast));
router.put('/broadcast', auditTrail('Setting'), asyncHandler(settingController.updateBroadcast));

module.exports = router;
