const response = require('../../middleware/responseHandler');
const validateParams = require('../../middleware/validateParams');
const { isValidDate } = require('../../utils/dateHelper');
const listPasienRalanService = require('../../services/main/listPasienRalanService');

exports.getListPasienRalan = async (req, res) => {
  const { tglawal, tglakhir } = req.query;

  if (validateParams(req, res, { tglawal, tglakhir })) return;

  if (!isValidDate(tglawal) || !isValidDate(tglakhir)) {
    return response.badRequest(req, res, 'Tanggal harus berformat YYYY-MM-DD');
  }

  try {
    const rowsWithSEP = await listPasienRalanService.getListPasienRalan(req.query);

    if (rowsWithSEP.length === 0) {
      return response.noContent(res);
    }

    return response.ok(res, rowsWithSEP);
  } catch (error) {
    return response.internalError(req, res, error);
  }
};
