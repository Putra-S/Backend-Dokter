const db = require('../../../config/db');
const validateParams = require('../../../middleware/validateParams');
const response = require('../../../middleware/responseHandler');

exports.getRiwayatPasien = async (req, res) => {
  const { no_rkm_medis } = req.query;

  const queryParams = { no_rkm_medis };
  const validateErrors = validateParams(req, res, queryParams);
  if (validateErrors) return;

  const queryRiwayat = `
        SELECT
            reg_periksa.no_reg,
            reg_periksa.no_rawat,
            reg_periksa.tgl_registrasi,
            reg_periksa.jam_reg,
            reg_periksa.kd_dokter,
            dokter.nm_dokter,
            poliklinik.nm_poli,
            reg_periksa.p_jawab,
            reg_periksa.almt_pj,
            reg_periksa.hubunganpj,
            reg_periksa.biaya_reg,
            reg_periksa.status_lanjut,
            penjab.png_jawab,
            reg_periksa.umurdaftar,
            reg_periksa.sttsumur
        FROM
            reg_periksa
        INNER JOIN dokter ON reg_periksa.kd_dokter = dokter.kd_dokter
        INNER JOIN poliklinik ON reg_periksa.kd_poli = poliklinik.kd_poli
        INNER JOIN penjab ON reg_periksa.kd_pj = penjab.kd_pj
        WHERE
            reg_periksa.stts <> 'Batal'
            AND reg_periksa.no_rkm_medis = ?
        ORDER BY
            reg_periksa.tgl_registrasi DESC,
            reg_periksa.no_rawat DESC,
            reg_periksa.jam_reg DESC
    `;

  try {
    const [riwayat] = await db.query(queryRiwayat, [no_rkm_medis]);

    if (riwayat.length === 0) return response.ok(res, []);

    const noRawatList = riwayat.map((item) => item.no_rawat);

    const queryDPJP = `
        SELECT dpjp_ranap.no_rawat, dokter.nm_dokter
        FROM dpjp_ranap
        INNER JOIN dokter ON dpjp_ranap.kd_dokter = dokter.kd_dokter
        WHERE dpjp_ranap.no_rawat IN (?)
        ORDER BY dpjp_ranap.pjranap_ke ASC
    `;

    const [dpjpRows] = await db.query(queryDPJP, [noRawatList]);

    const dpjpMap = new Map();
    dpjpRows.forEach((row) => {
      if (!dpjpMap.has(row.no_rawat)) {
        dpjpMap.set(row.no_rawat, []);
      }
      dpjpMap.get(row.no_rawat).push(row.nm_dokter);
    });

    const result = riwayat.map((item) => ({
      ...item,
      dpjp: dpjpMap.get(item.no_rawat) || [],
    }));

    return response.ok(res, result);
  } catch (err) {
    return response.internalError(req, res, err);
  }
};
