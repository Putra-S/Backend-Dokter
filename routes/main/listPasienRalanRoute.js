const { Hono } = require('hono');
const asyncHandler = require('../../middleware/asyncHandler');
const router = new Hono();
const listPasienRalanController = require('../../controllers/main/listPasienRalanController');

router.get('/', asyncHandler(listPasienRalanController.getListPasienRalan));

module.exports = router;
