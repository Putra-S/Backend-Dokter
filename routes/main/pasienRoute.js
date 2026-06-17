const { Hono } = require('hono');
const asyncHandler = require('../../middleware/asyncHandler');
const router = new Hono();
const patientController = require('../../controllers/main/pasienController');

router.get('/', asyncHandler(patientController.getPatients));
router.get('/detail', asyncHandler(patientController.getPasienByNoRm));
router.get('/detail/norawat', asyncHandler(patientController.getPasienByNoRawat));

module.exports = router;
