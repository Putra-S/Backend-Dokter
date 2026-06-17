const { Hono } = require('hono');
const asyncHandler = require('../../middleware/asyncHandler');
const router = new Hono();
const jadwalOperasiController = require('../../controllers/main/jadwalOperasiController');

router.get('/operasi', asyncHandler(jadwalOperasiController.getJadwalOperasi));
router.get('/bed', asyncHandler(jadwalOperasiController.getBed));

module.exports = router;
