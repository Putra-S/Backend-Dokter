const db = require('../../../config/db');
const validateParams = require('../../../middleware/validateParams');
const response = require('../../../middleware/responseHandler');

exports.getRiwayatMedisRanap = async (req, res) => {
  const { no_rawat } = req.query;

  const queryParams = { no_rawat };
  const validateErrors = validateParams(req, res, queryParams);
  if (validateErrors) return;

  const query = `SELECT
          penilaian_medis_ranap.tanggal,
          penilaian_medis_ranap.kd_dokter,
          penilaian_medis_ranap.anamnesis,
          penilaian_medis_ranap.hubungan,
          penilaian_medis_ranap.keluhan_utama,
          penilaian_medis_ranap.rps,
          penilaian_medis_ranap.rpk,
          penilaian_medis_ranap.rpd,
          penilaian_medis_ranap.rpo,
          penilaian_medis_ranap.alergi,
          penilaian_medis_ranap.keadaan,
          penilaian_medis_ranap.gcs,
          penilaian_medis_ranap.kesadaran,
          penilaian_medis_ranap.td,
          penilaian_medis_ranap.nadi,
          penilaian_medis_ranap.rr,
          penilaian_medis_ranap.suhu,
          penilaian_medis_ranap.spo,
          penilaian_medis_ranap.bb,
          penilaian_medis_ranap.tb,
          penilaian_medis_ranap.kepala,
          penilaian_medis_ranap.mata,
          penilaian_medis_ranap.gigi,
          penilaian_medis_ranap.tht,
          penilaian_medis_ranap.thoraks,
          penilaian_medis_ranap.jantung,
          penilaian_medis_ranap.paru,
          penilaian_medis_ranap.abdomen,
          penilaian_medis_ranap.ekstremitas,
          penilaian_medis_ranap.genital,
          penilaian_medis_ranap.kulit,
          penilaian_medis_ranap.ket_kepala,
          penilaian_medis_ranap.ket_mata,
          penilaian_medis_ranap.ket_gigi,
          penilaian_medis_ranap.ket_tht,
          penilaian_medis_ranap.ket_thoraks,
          penilaian_medis_ranap.ket_jantung,
          penilaian_medis_ranap.ket_paru,
          penilaian_medis_ranap.ket_abdomen,
          penilaian_medis_ranap.ket_genital,
          penilaian_medis_ranap.ket_ekstremitas,
          penilaian_medis_ranap.ket_kulit,
          penilaian_medis_ranap.ket_lokalis,
          penilaian_medis_ranap.lab,
          penilaian_medis_ranap.rad,
          penilaian_medis_ranap.penunjang,
          penilaian_medis_ranap.diagnosis,
          penilaian_medis_ranap.tata,
          penilaian_medis_ranap.edukasi,
          dokter.nm_dokter
      FROM
          penilaian_medis_ranap
          INNER JOIN dokter ON penilaian_medis_ranap.kd_dokter = dokter.kd_dokter
      WHERE
          penilaian_medis_ranap.no_rawat = ?`;

  const [rows] = await db.query(query, [no_rawat]);

  if (rows.length === 0) {
    return response.noContent(res);
  }
  return response.ok(res, rows);
};

exports.getRiwayatMedisRanapNeonatus = async (req, res) => {
  const { no_rawat } = req.query;

  const queryParams = { no_rawat };
  const validateErrors = validateParams(req, res, queryParams);
  if (validateErrors) return;

  const query = `SELECT
          penilaian_medis_ranap_neonatus.tanggal,
          penilaian_medis_ranap_neonatus.kd_dokter,
          penilaian_medis_ranap_neonatus.anamnesis,
          penilaian_medis_ranap_neonatus.hubungan,
          penilaian_medis_ranap_neonatus.keluhan_utama,
          penilaian_medis_ranap_neonatus.rps,
          penilaian_medis_ranap_neonatus.rpk,
          penilaian_medis_ranap_neonatus.rpd,
          penilaian_medis_ranap_neonatus.rpo,
          penilaian_medis_ranap_neonatus.alergi,
          penilaian_medis_ranap_neonatus.keadaan,
          penilaian_medis_ranap_neonatus.gcs,
          penilaian_medis_ranap_neonatus.kesadaran,
          penilaian_medis_ranap_neonatus.td,
          penilaian_medis_ranap_neonatus.nadi,
          penilaian_medis_ranap_neonatus.rr,
          penilaian_medis_ranap_neonatus.suhu,
          penilaian_medis_ranap_neonatus.spo,
          penilaian_medis_ranap_neonatus.bb,
          penilaian_medis_ranap_neonatus.tb,
          penilaian_medis_ranap_neonatus.pb,
          penilaian_medis_ranap_neonatus.lk,
          penilaian_medis_ranap_neonatus.ld,
          penilaian_medis_ranap_neonatus.lp,
          penilaian_medis_ranap_neonatus.kepala,
          penilaian_medis_ranap_neonatus.mata,
          penilaian_medis_ranap_neonatus.gigi,
          penilaian_medis_ranap_neonatus.tht,
          penilaian_medis_ranap_neonatus.thoraks,
          penilaian_medis_ranap_neonatus.jantung,
          penilaian_medis_ranap_neonatus.paru,
          penilaian_medis_ranap_neonatus.abdomen,
          penilaian_medis_ranap_neonatus.ekstremitas,
          penilaian_medis_ranap_neonatus.genital,
          penilaian_medis_ranap_neonatus.kulit,
          penilaian_medis_ranap_neonatus.keterangan,
          penilaian_medis_ranap_neonatus.f1,
          penilaian_medis_ranap_neonatus.u1,
          penilaian_medis_ranap_neonatus.t1,
          penilaian_medis_ranap_neonatus.r1,
          penilaian_medis_ranap_neonatus.w1,
          penilaian_medis_ranap_neonatus.n1,
          penilaian_medis_ranap_neonatus.f5,
          penilaian_medis_ranap_neonatus.u5,
          penilaian_medis_ranap_neonatus.t5,
          penilaian_medis_ranap_neonatus.r5,
          penilaian_medis_ranap_neonatus.w5,
          penilaian_medis_ranap_neonatus.n5,
          penilaian_medis_ranap_neonatus.f10,
          penilaian_medis_ranap_neonatus.u10,
          penilaian_medis_ranap_neonatus.t10,
          penilaian_medis_ranap_neonatus.r10,
          penilaian_medis_ranap_neonatus.w10,
          penilaian_medis_ranap_neonatus.n10,
          penilaian_medis_ranap_neonatus.frekuensinafas,
          penilaian_medis_ranap_neonatus.nilaifrekuensinafas,
          penilaian_medis_ranap_neonatus.retraksi,
          penilaian_medis_ranap_neonatus.nilairetraksi,
          penilaian_medis_ranap_neonatus.sianosis,
          penilaian_medis_ranap_neonatus.nilaisianosis,
          penilaian_medis_ranap_neonatus.udaramasuk,
          penilaian_medis_ranap_neonatus.nilaiudaramasuk,
          penilaian_medis_ranap_neonatus.merintih,
          penilaian_medis_ranap_neonatus.nilaimerintih,
          penilaian_medis_ranap_neonatus.totaldowns,
          penilaian_medis_ranap_neonatus.lab,
          penilaian_medis_ranap_neonatus.rad,
          penilaian_medis_ranap_neonatus.penunjang,
          penilaian_medis_ranap_neonatus.diagnosis,
          penilaian_medis_ranap_neonatus.tata,
          penilaian_medis_ranap_neonatus.edukasi,
          dokter.nm_dokter
      FROM
          penilaian_medis_ranap_neonatus
          INNER JOIN dokter ON penilaian_medis_ranap_neonatus.kd_dokter = dokter.kd_dokter
      WHERE
          penilaian_medis_ranap_neonatus.no_rawat = ?`;

  const [rows] = await db.query(query, [no_rawat]);

  if (rows.length === 0) {
    return response.noContent(res);
  }
  return response.ok(res, rows);
};

exports.getRiwayatMedisRanapKebidanan = async (req, res) => {
  const { no_rawat } = req.query;

  const queryParams = { no_rawat };
  const validateErrors = validateParams(req, res, queryParams);
  if (validateErrors) return;

  const query = `SELECT
          penilaian_medis_ranap_kandungan.tanggal,
          penilaian_medis_ranap_kandungan.kd_dokter,
          penilaian_medis_ranap_kandungan.anamnesis,
          penilaian_medis_ranap_kandungan.hubungan,
          penilaian_medis_ranap_kandungan.keluhan_utama,
          penilaian_medis_ranap_kandungan.rps,
          penilaian_medis_ranap_kandungan.rpk,
          penilaian_medis_ranap_kandungan.rpd,
          penilaian_medis_ranap_kandungan.rpo,
          penilaian_medis_ranap_kandungan.alergi,
          penilaian_medis_ranap_kandungan.keadaan,
          penilaian_medis_ranap_kandungan.gcs,
          penilaian_medis_ranap_kandungan.kesadaran,
          penilaian_medis_ranap_kandungan.td,
          penilaian_medis_ranap_kandungan.nadi,
          penilaian_medis_ranap_kandungan.rr,
          penilaian_medis_ranap_kandungan.suhu,
          penilaian_medis_ranap_kandungan.spo,
          penilaian_medis_ranap_kandungan.bb,
          penilaian_medis_ranap_kandungan.tb,
          penilaian_medis_ranap_kandungan.kepala,
          penilaian_medis_ranap_kandungan.mata,
          penilaian_medis_ranap_kandungan.gigi,
          penilaian_medis_ranap_kandungan.tht,
          penilaian_medis_ranap_kandungan.thoraks,
          penilaian_medis_ranap_kandungan.jantung,
          penilaian_medis_ranap_kandungan.paru,
          penilaian_medis_ranap_kandungan.abdomen,
          penilaian_medis_ranap_kandungan.ekstremitas,
          penilaian_medis_ranap_kandungan.genital,
          penilaian_medis_ranap_kandungan.kulit,
          penilaian_medis_ranap_kandungan.ket_kepala,
          penilaian_medis_ranap_kandungan.ket_mata,
          penilaian_medis_ranap_kandungan.ket_gigi,
          penilaian_medis_ranap_kandungan.ket_tht,
          penilaian_medis_ranap_kandungan.ket_thoraks,
          penilaian_medis_ranap_kandungan.ket_jantung,
          penilaian_medis_ranap_kandungan.ket_paru,
          penilaian_medis_ranap_kandungan.ket_abdomen,
          penilaian_medis_ranap_kandungan.ket_genital,
          penilaian_medis_ranap_kandungan.ket_ekstremitas,
          penilaian_medis_ranap_kandungan.ket_kulit,
          penilaian_medis_ranap_kandungan.tfu,
          penilaian_medis_ranap_kandungan.tbj,
          penilaian_medis_ranap_kandungan.his,
          penilaian_medis_ranap_kandungan.kontraksi,
          penilaian_medis_ranap_kandungan.djj,
          penilaian_medis_ranap_kandungan.inspeksi,
          penilaian_medis_ranap_kandungan.inspekulo,
          penilaian_medis_ranap_kandungan.vt,
          penilaian_medis_ranap_kandungan.rt,
          penilaian_medis_ranap_kandungan.ultra,
          penilaian_medis_ranap_kandungan.kardio,
          penilaian_medis_ranap_kandungan.lab,
          penilaian_medis_ranap_kandungan.diagnosis,
          penilaian_medis_ranap_kandungan.tata,
          penilaian_medis_ranap_kandungan.edukasi,
          dokter.nm_dokter
      FROM
          penilaian_medis_ranap_kandungan
          INNER JOIN dokter ON penilaian_medis_ranap_kandungan.kd_dokter = dokter.kd_dokter
      WHERE
          penilaian_medis_ranap_kandungan.no_rawat = ?`;

  const [rows] = await db.query(query, [no_rawat]);

  if (rows.length === 0) {
    return response.noContent(res);
  }
  return response.ok(res, rows);
};
