const { Hono } = require('hono');
const asyncHandler = require('../../middleware/asyncHandler');
const router = new Hono();
const listPasienRanapController = require('../../controllers/main/listPasienRanapController');

router.get('/', asyncHandler(listPasienRanapController.getListPasienRanap));

module.exports = router;
