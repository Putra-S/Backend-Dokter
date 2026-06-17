const db = require('../../../config/db');
const validateParams = require('../../../middleware/validateParams');
const response = require('../../../middleware/responseHandler');

exports.getKebidananIgd = async (req, res) => {
  const { no_rawat } = req.query;

  const queryParams = { no_rawat };
  const validateErrors = validateParams(req, res, queryParams);
  if (validateErrors) return;

  try {
    const [kebidanan] = await db.query(
      `
      SELECT igd.*, pg.nama AS nama_petugas
      FROM penilaian_awal_keperawatan_kebidanan_igd igd
      LEFT JOIN pegawai pg ON igd.nip = pg.nik
      WHERE igd.no_rawat = ?
    `,
      [no_rawat]
    );

    const [masalah] = await db.query(
      `
      SELECT pm.kode_masalah, mm.nama_masalah
      FROM penilaian_awal_keperawatan_kebidanan_masalah_igd pm
      LEFT JOIN master_masalah_keperawatan_kebidanan mm ON pm.kode_masalah = mm.kode_masalah
      WHERE pm.no_rawat = ?
    `,
      [no_rawat]
    );

    const [rencana] = await db.query(
      `
      SELECT pr.kode_rencana, mr.rencana_kebidanan
      FROM penilaian_awal_keperawatan_kebidanan_rencana_igd pr
      LEFT JOIN master_rencana_keperawatan_kebidanan mr ON pr.kode_rencana = mr.kode_rencana
      WHERE pr.no_rawat = ?
    `,
      [no_rawat]
    );

    const result = {
      kebidanan: kebidanan[0] || null,
      masalah_kebidanan: masalah.map((row) => row.nama_masalah),
      rencana_kebidanan: rencana.map((row) => row.rencana_kebidanan),
    };

    return response.ok(res, result);
  } catch (err) {
    return response.internalError(req, res, err);
  }
};
