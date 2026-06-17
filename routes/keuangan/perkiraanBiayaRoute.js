const { Hono } = require('hono');
const asyncHandler = require('../../middleware/asyncHandler');
const router = new Hono();
const perkiraanBiayaController = require('../../controllers/keuangan/perkiraanBiayaController');

router.get('/', asyncHandler(perkiraanBiayaController.getPerkiraanBiaya));

module.exports = router;
