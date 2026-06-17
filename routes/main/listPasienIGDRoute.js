const { Hono } = require('hono');
const asyncHandler = require('../../middleware/asyncHandler');
const router = new Hono();
const listPasienIGDController = require('../../controllers/main/listPasienIGDController');

router.get('/', asyncHandler(listPasienIGDController.getListPasienIGD));

module.exports = router;
