const db = require('../../../config/db');
const validateParams = require('../../../middleware/validateParams');
const response = require('../../../middleware/responseHandler');

exports.getRiwayatSbar = async (req, res) => {
  const { no_rawat } = req.query;

  const queryParams = { no_rawat };
  const validateErrors = validateParams(req, res, queryParams);
  if (validateErrors) return;

  const sql = `
    SELECT
      pemeriksaan_ranap_sbar.tgl_perawatan,
      pemeriksaan_ranap_sbar.jam_rawat,
      pemeriksaan_ranap_sbar.situation,
      pemeriksaan_ranap_sbar.background,
      pemeriksaan_ranap_sbar.assesment,
      pemeriksaan_ranap_sbar.recommendation,
      pemeriksaan_ranap_sbar.nip,
      pemeriksaan_ranap_sbar.kd_dokter,
      pegawai.nama,
      namavalidator.nama AS namavalidator,
      validasi_pemeriksaan_sbar.nik_validator,
      validasi_pemeriksaan_sbar.tgl_validasi,
      validasi_pemeriksaan_sbar.jam_validasi,
      validasi_pemeriksaan_sbar.status_validasi
    FROM
      pemeriksaan_ranap_sbar
      INNER JOIN pegawai ON pemeriksaan_ranap_sbar.nip = pegawai.nik
      LEFT JOIN pegawai AS namavalidator ON pemeriksaan_ranap_sbar.kd_dokter = namavalidator.nik
      LEFT JOIN validasi_pemeriksaan_sbar ON pemeriksaan_ranap_sbar.jam_rawat = validasi_pemeriksaan_sbar.jam_rawat
      AND pemeriksaan_ranap_sbar.no_rawat = validasi_pemeriksaan_sbar.no_rawat
      AND pemeriksaan_ranap_sbar.tgl_perawatan = validasi_pemeriksaan_sbar.tgl_perawatan
    WHERE
      pemeriksaan_ranap_sbar.no_rawat = ?
    ORDER BY
      pemeriksaan_ranap_sbar.tgl_perawatan,
      pemeriksaan_ranap_sbar.jam_rawat
  `;

  const [rows] = await db.query(sql, [no_rawat]);

  if (rows.length === 0) {
    return response.noContent(res);
  }

  return response.ok(res, rows);
};
