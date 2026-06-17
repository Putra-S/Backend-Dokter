const db = require('../../../config/db');
const validateParams = require('../../../middleware/validateParams');
const response = require('../../../middleware/responseHandler');

exports.getRadiologi = async (req, res) => {
  const { no_rawat } = req.query;

  const queryParams = { no_rawat };
  const validateErrors = validateParams(req, res, queryParams);
  if (validateErrors) return;

  const [rows] = await db.query(
    `SELECT
        periksa_radiologi.tgl_periksa,
        periksa_radiologi.jam,
        jns_perawatan_radiologi.nm_perawatan,
        petugas.nama,
        periksa_radiologi.biaya,
        periksa_radiologi.dokter_perujuk,
        dokter.nm_dokter,
        CONCAT(
          IF(periksa_radiologi.proyeksi <> '', CONCAT('Proyeksi : ', periksa_radiologi.proyeksi, ', '), ''),
          IF(periksa_radiologi.kV <> '', CONCAT('kV : ', periksa_radiologi.kV, ', '), ''),
          IF(periksa_radiologi.mAS <> '', CONCAT('mAS : ', periksa_radiologi.mAS, ', '), ''),
          IF(periksa_radiologi.FFD <> '', CONCAT('FFD : ', periksa_radiologi.FFD, ', '), ''),
          IF(periksa_radiologi.BSF <> '', CONCAT('BSF : ', periksa_radiologi.BSF, ', '), ''),
          IF(periksa_radiologi.inak <> '', CONCAT('Inak : ', periksa_radiologi.inak, ', '), ''),
          IF(periksa_radiologi.jml_penyinaran <> '', CONCAT('Jml Penyinaran : ', periksa_radiologi.jml_penyinaran, ', '), ''),
          IF(periksa_radiologi.dosis <> '', CONCAT('Dosis Radiasi : ', periksa_radiologi.dosis), '')
        ) AS proyeksi
      FROM periksa_radiologi
      INNER JOIN jns_perawatan_radiologi ON periksa_radiologi.kd_jenis_prw = jns_perawatan_radiologi.kd_jenis_prw
      INNER JOIN petugas ON periksa_radiologi.nip = petugas.nip
      INNER JOIN dokter ON periksa_radiologi.kd_dokter = dokter.kd_dokter
      WHERE periksa_radiologi.no_rawat = ? AND jns_perawatan_radiologi.nm_perawatan <> 'On Call'
      ORDER BY periksa_radiologi.tgl_periksa, periksa_radiologi.jam`,
    [no_rawat]
  );

  if (rows.length === 0) return response.noContent(res);

  const total_biaya = rows.reduce((acc, curr) => acc + (Number.parseFloat(curr.biaya) || 0), 0);

  const [hasilRows] = await db.query(
    'SELECT tgl_periksa, jam, hasil FROM hasil_radiologi WHERE no_rawat = ?',
    [no_rawat]
  );
  const [gambarRows] = await db.query(
    'SELECT tgl_periksa, jam, lokasi_gambar FROM gambar_radiologi WHERE no_rawat = ?',
    [no_rawat]
  );

  const grouped = {};
  rows.forEach((item) => {
    const key = `${item.tgl_periksa}_${item.jam}`;
    if (!grouped[key]) {
      const hasilItem = hasilRows.find(
        (h) => h.tgl_periksa === item.tgl_periksa && h.jam === item.jam
      );
      const gambarItem = gambarRows.find(
        (g) => g.tgl_periksa === item.tgl_periksa && g.jam === item.jam
      );

      grouped[key] = {
        tgl_periksa: item.tgl_periksa,
        jam: item.jam,
        nm_dokter: item.nm_dokter,
        nama: item.nama,
        hasil: hasilItem ? hasilItem.hasil : null,
        lokasi_gambar: gambarItem
          ? `${process.env.HOST_WEB}:${process.env.HOST_WEB_PORT}/${process.env.HOST_WEB_ROOT}/radiologi/${gambarItem.lokasi_gambar}`
          : null,
        nm_perawatan: [item.nm_perawatan],
        biaya: item.biaya,
        dokter_perujuk: item.dokter_perujuk,
      };
    } else {
      grouped[key].nm_perawatan.push(item.nm_perawatan);
      grouped[key].biaya += item.biaya;
    }
  });

  const result = Object.values(grouped);

  return response.ok(res, { list: result, total_biaya: total_biaya });
};
