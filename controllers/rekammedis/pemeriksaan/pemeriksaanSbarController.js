const db = require('../../../config/db');
const dayjs = require('dayjs');
const validateParams = require('../../../middleware/validateParams');
const response = require('../../../middleware/responseHandler');

exports.getPemeriksaanById = async (req, res) => {
  const { no_rawat } = req.query;

  const queryParams = { no_rawat };
  const validateErrors = validateParams(req, res, queryParams);
  if (validateErrors) return;

  const query = `
          SELECT
              pr.no_rawat,
              pr.tgl_perawatan,
              pr.jam_rawat,
              pr.situation,
              pr.background,
              pr.assesment,
              pr.recommendation,
              perawat.nik AS nip,
              perawat.nama AS nip_nama,
              dokter.nik AS kd_dokter,
              dokter.nama AS kd_dokter_nama,
              vps.status_validasi,
              vps.tgl_validasi,
              vps.jam_validasi
          FROM pemeriksaan_ranap_sbar pr
          LEFT JOIN pegawai perawat ON pr.nip = perawat.nik
          LEFT JOIN pegawai dokter ON pr.kd_dokter = dokter.nik
          LEFT JOIN validasi_pemeriksaan_sbar vps ON pr.no_rawat = vps.no_rawat AND pr.tgl_perawatan = vps.tgl_perawatan AND pr.jam_rawat = vps.jam_rawat
          WHERE pr.no_rawat = ?
          ORDER BY pr.no_rawat DESC, pr.tgl_perawatan DESC, pr.jam_rawat DESC
      `;

  const [rows] = await db.query(query, [req.query.no_rawat]);

  if (rows.length === 0) {
    return response.noContent(res);
  }

  const result = rows.map((row) => ({
    no_rawat: row.no_rawat,

    tgl_perawatan: row.tgl_perawatan ? dayjs(row.tgl_perawatan).format('YYYY-MM-DD') : null,
    jam_rawat: row.jam_rawat,
    situation: row.situation,
    background: row.background,
    assesment: row.assesment,
    recommendation: row.recommendation,
    petugas: {
      nik: row.nip,
      nama: row.nip_nama,
    },
    dokter: {
      nik: row.kd_dokter,
      nama: row.kd_dokter_nama,
    },
    validasi: {
      status_validasi: row.status_validasi ? row.status_validasi : null,
      tgl_validasi: row.tgl_validasi ? dayjs(row.tgl_validasi).format('YYYY-MM-DD') : null,
      jam_validasi: row.jam_validasi
        ? dayjs(row.jam_validasi, 'HH:mm:ss').format('HH:mm:ss')
        : null,
    },
  }));

  return response.ok(res, result);
};

exports.createPemeriksaan = async (req, res) => {
  let {
    no_rawat,
    situation,
    background,
    assesment,
    recommendation,
    kd_dokter,
    nip,
    tgl_perawatan,
    jam_rawat,
  } = req.body;

  if (!tgl_perawatan || tgl_perawatan.trim() === '') {
    tgl_perawatan = dayjs().format('YYYY-MM-DD');
  }

  if (!jam_rawat || jam_rawat.trim() === '') {
    jam_rawat = dayjs().format('HH:mm:ss');
  }

  const queryParams = { no_rawat, tgl_perawatan, jam_rawat, nip, kd_dokter };
  const validateErrors = validateParams(req, res, queryParams);
  if (validateErrors) return;

  const data = req.body;

  const [result] = await db.query(
    'INSERT INTO pemeriksaan_ranap_sbar (no_rawat, tgl_perawatan, jam_rawat, situation, background, assesment, recommendation, nip, kd_dokter) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      no_rawat,
      tgl_perawatan,
      jam_rawat,
      situation,
      background,
      assesment,
      recommendation,
      nip,
      kd_dokter,
    ]
  );

  if (result.affectedRows === 0) {
    return response.failedSave(res);
  }

  return response.created(res, data);
};

exports.updatePemeriksaan = async (req, res) => {
  const {
    no_rawat,
    situation,
    background,
    assesment,
    recommendation,
    nip,
    kd_dokter,
    tgl_perawatan,
    jam_rawat,
  } = req.body;

  const queryParams = { no_rawat, tgl_perawatan, jam_rawat, nip, kd_dokter };
  const validateErrors = validateParams(req, res, queryParams);
  if (validateErrors) return;

  const data = req.body;

  const [result] = await db.query(
    'UPDATE pemeriksaan_ranap_sbar SET situation = ?, background = ?, assesment = ?, recommendation = ?, nip = ?, kd_dokter = ? WHERE no_rawat = ? AND tgl_perawatan = ? AND jam_rawat = ?',
    [
      situation,
      background,
      assesment,
      recommendation,
      nip,
      kd_dokter,
      no_rawat,
      tgl_perawatan,
      jam_rawat,
    ]
  );

  if (result.affectedRows === 0) {
    return response.failedUpdate(res);
  }

  return response.ok(res, data);
};

exports.deletePemeriksaan = async (req, res) => {
  const { no_rawat, tgl_perawatan, jam_rawat } = req.body;

  const queryParams = { no_rawat, tgl_perawatan, jam_rawat };
  const validateErrors = validateParams(req, res, queryParams);
  if (validateErrors) return;

  const data = req.body;

  const [result] = await db.query(
    'DELETE FROM pemeriksaan_ranap_sbar WHERE no_rawat = ? AND tgl_perawatan = ? AND jam_rawat = ?',
    [no_rawat, tgl_perawatan, jam_rawat]
  );

  if (result.affectedRows === 0) {
    return response.failedDelete(res);
  }

  return response.ok(res, data);
};

exports.validasiPemeriksaan = async (req, res) => {
  const { no_rawat, tgl_perawatan, jam_rawat, nik } = req.body;

  const queryParams = { no_rawat, tgl_perawatan, jam_rawat, nik };
  const validateErrors = validateParams(req, res, queryParams);
  if (validateErrors) return;

  const data = req.body;

  const [checkResult] = await db.query(
    'SELECT * FROM pemeriksaan_ranap_sbar WHERE no_rawat = ? AND tgl_perawatan = ? AND jam_rawat = ?',
    [no_rawat, tgl_perawatan, jam_rawat]
  );

  if (checkResult.length === 0) {
    return response.noContent(res);
  }
  const [result] = await db.query(
    'INSERT INTO validasi_pemeriksaan_sbar (no_rawat, tgl_perawatan, jam_rawat, nik_validator, tgl_validasi, jam_validasi, status_validasi) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      no_rawat,
      tgl_perawatan,
      jam_rawat,
      nik,
      dayjs().format('YYYY-MM-DD'),
      dayjs().format('HH:mm:ss'),
      'Validasi',
    ]
  );

  if (result.affectedRows === 0) {
    return response.failedSave(res);
  }

  return response.created(res, data);
};

exports.getPemeriksaanByDokter = async (req, res) => {
  const { kd_dokter } = req.query;

  const queryParams = { kd_dokter };
  const validateErrors = validateParams(req, res, queryParams);
  if (validateErrors) return;

  const query = `
          SELECT
            pr.no_rawat,
            pr.tgl_perawatan,
            pr.jam_rawat,
            pr.situation,
            pr.background,
            pr.assesment,
            pr.recommendation,
            perawat.nik AS nip,
            perawat.nama AS nip_nama,
            dokter.nik AS kd_dokter,
            dokter.nama AS kd_dokter_nama,
            vps.status_validasi,
            vps.tgl_validasi,
            vps.jam_validasi
          FROM
            pemeriksaan_ranap_sbar AS pr
            LEFT JOIN
            pegawai AS perawat
            ON
              pr.nip = perawat.nik
            LEFT JOIN
            pegawai AS dokter
            ON
              pr.kd_dokter = dokter.nik
            LEFT JOIN
            validasi_pemeriksaan_sbar AS vps
            ON
              pr.no_rawat = vps.no_rawat AND
              pr.tgl_perawatan = vps.tgl_perawatan AND
              pr.jam_rawat = vps.jam_rawat
            INNER JOIN
            kamar_inap
            ON
              pr.no_rawat = kamar_inap.no_rawat
          WHERE
            pr.kd_dokter = ? AND
            kamar_inap.stts_pulang = '-'
          ORDER BY
            pr.no_rawat DESC,
            pr.tgl_perawatan DESC,
            pr.jam_rawat DESC
      `;

  const [rows] = await db.query(query, [req.query.kd_dokter]);

  if (rows.length === 0) {
    return response.noContent(res);
  }

  const result = rows.map((row) => ({
    no_rawat: row.no_rawat,

    tgl_perawatan: row.tgl_perawatan ? dayjs(row.tgl_perawatan).format('YYYY-MM-DD') : null,
    jam_rawat: row.jam_rawat,
    situation: row.situation,
    background: row.background,
    assesment: row.assesment,
    recommendation: row.recommendation,
    petugas: {
      nik: row.nip,
      nama: row.nip_nama,
    },
    dokter: {
      nik: row.kd_dokter,
      nama: row.kd_dokter_nama,
    },
    validasi: {
      status_validasi: row.status_validasi ? row.status_validasi : null,
      tgl_validasi: row.tgl_validasi ? dayjs(row.tgl_validasi).format('YYYY-MM-DD') : null,
      jam_validasi: row.jam_validasi
        ? dayjs(row.jam_validasi, 'HH:mm:ss').format('HH:mm:ss')
        : null,
    },
  }));

  return response.ok(res, result);
};
