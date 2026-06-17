const db = require('../../../config/db');
const validateParams = require('../../../middleware/validateParams');
const response = require('../../../middleware/responseHandler');

exports.getDiagnosa = async (req, res) => {
  const { no_rawat } = req.query;

  const queryParams = { no_rawat };
  const validateErrors = validateParams(req, res, queryParams);
  if (validateErrors) return;

  const query = `SELECT
          diagnosa_pasien.kd_penyakit,
          penyakit.nm_penyakit,
          diagnosa_pasien.STATUS
      FROM
          diagnosa_pasien
          INNER JOIN penyakit ON diagnosa_pasien.kd_penyakit = penyakit.kd_penyakit
      WHERE
          diagnosa_pasien.no_rawat = ?`;

  const [rows] = await db.query(query, [no_rawat]);

  if (rows.length === 0) {
    return response.noContent(res);
  }

  return response.ok(res, rows);
};

exports.getProsedur = async (req, res) => {
  const { no_rawat } = req.query;

  const queryParams = { no_rawat };
  const validateErrors = validateParams(req, res, queryParams);
  if (validateErrors) return;

  const query = `SELECT
          prosedur_pasien.kode,
          icd9.deskripsi_panjang,
          prosedur_pasien.STATUS
      FROM
          prosedur_pasien
          INNER JOIN icd9 ON prosedur_pasien.kode = icd9.kode
      WHERE
          prosedur_pasien.no_rawat = ?`;

  const [rows] = await db.query(query, [no_rawat]);

  if (rows.length === 0) {
    return response.noContent(res);
  }

  return response.ok(res, rows);
};
