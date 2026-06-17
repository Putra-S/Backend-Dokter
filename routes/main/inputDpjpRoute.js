const { Hono } = require('hono');
const asyncHandler = require('../../middleware/asyncHandler');
const router = new Hono();
const auditTrail = require('../../middleware/auditTrail');
const inputDpjpController = require('../../controllers/main/inputDpjpController');

router.get('/', asyncHandler(inputDpjpController.getDpjp));
router.post('/', auditTrail('Input DPJP Ranap'), asyncHandler(inputDpjpController.inputDpjp));
router.put('/', auditTrail('Update DPJP Ranap'), asyncHandler(inputDpjpController.updateDpjp));
router.delete('/', auditTrail('Delete DPJP Ranap'), asyncHandler(inputDpjpController.deleteDpjp));

module.exports = router;
