const db = require('../config/db');

const PASIEN_BASE_SELECT = `
  SELECT
    pasien.no_rkm_medis, pasien.nm_pasien, pasien.no_ktp, pasien.jk,
    pasien.tmp_lahir, pasien.tgl_lahir, pasien.nm_ibu, pasien.alamat,
    kelurahan.nm_kel, kecamatan.nm_kec, kabupaten.nm_kab, propinsi.nm_prop,
    pasien.gol_darah, pasien.pekerjaan, pasien.stts_nikah, pasien.agama,
    pasien.tgl_daftar, pasien.no_tlp, pasien.umur, pasien.pnd,
    pasien.keluarga, pasien.namakeluarga, penjab.png_jawab, pasien.no_peserta,
    pasien.pekerjaanpj, pasien.alamatpj, pasien.kelurahanpj, pasien.kecamatanpj,
    pasien.kabupatenpj, pasien.propinsipj,
    perusahaan_pasien.kode_perusahaan, perusahaan_pasien.nama_perusahaan,
    pasien.bahasa_pasien, bahasa_pasien.nama_bahasa,
    pasien.suku_bangsa, suku_bangsa.nama_suku_bangsa,
    pasien.nip, pasien.email, cacat_fisik.nama_cacat, pasien.cacat_fisik, pasien.kd_pj
  FROM pasien
    LEFT JOIN kelurahan ON pasien.kd_kel = kelurahan.kd_kel
    LEFT JOIN kecamatan ON pasien.kd_kec = kecamatan.kd_kec
    LEFT JOIN kabupaten ON pasien.kd_kab = kabupaten.kd_kab
    LEFT JOIN propinsi ON pasien.kd_prop = propinsi.kd_prop
    LEFT JOIN perusahaan_pasien ON perusahaan_pasien.kode_perusahaan = pasien.perusahaan_pasien
    LEFT JOIN cacat_fisik ON pasien.cacat_fisik = cacat_fisik.id
    LEFT JOIN bahasa_pasien ON bahasa_pasien.id = pasien.bahasa_pasien
    LEFT JOIN suku_bangsa ON suku_bangsa.id = pasien.suku_bangsa
    LEFT JOIN penjab ON pasien.kd_pj = penjab.kd_pj
  WHERE 1 = 1`;

exports.findAll = async ({ search, address, orderClause = '', limit = 100 }) => {
  const params = [];
  let query = '';

  if (!search && !address) {
    const fastOrderClause = orderClause.replace(/pasien\./g, '');
    query = `
      SELECT p.no_rkm_medis, p.nm_pasien, p.no_ktp, p.jk,
        p.tmp_lahir, p.tgl_lahir, p.nm_ibu, p.alamat,
        k.nm_kel, kc.nm_kec, kb.nm_kab, pr.nm_prop,
        p.gol_darah, p.pekerjaan, p.stts_nikah, p.agama,
        p.tgl_daftar, p.no_tlp, p.umur, p.pnd,
        p.keluarga, p.namakeluarga, pj.png_jawab, p.no_peserta,
        p.pekerjaanpj, p.alamatpj, p.kelurahanpj, p.kecamatanpj,
        p.kabupatenpj, p.propinsipj,
        per.kode_perusahaan, per.nama_perusahaan,
        p.bahasa_pasien, bp.nama_bahasa,
        p.suku_bangsa, sb.nama_suku_bangsa,
        p.nip, p.email, cf.nama_cacat, p.cacat_fisik, p.kd_pj
      FROM (
        SELECT * FROM pasien
        WHERE 1 = 1
        ${fastOrderClause}
        LIMIT ?
      ) p
      LEFT JOIN kelurahan k ON p.kd_kel = k.kd_kel
      LEFT JOIN kecamatan kc ON p.kd_kec = kc.kd_kec
      LEFT JOIN kabupaten kb ON p.kd_kab = kb.kd_kab
      LEFT JOIN propinsi pr ON p.kd_prop = pr.kd_prop
      LEFT JOIN perusahaan_pasien per ON per.kode_perusahaan = p.perusahaan_pasien
      LEFT JOIN cacat_fisik cf ON p.cacat_fisik = cf.id
      LEFT JOIN bahasa_pasien bp ON bp.id = p.bahasa_pasien
      LEFT JOIN suku_bangsa sb ON sb.id = p.suku_bangsa
      LEFT JOIN penjab pj ON p.kd_pj = pj.kd_pj
    `;
    params.push(Number.parseInt(limit, 10) || 100);
  } else {
    query = PASIEN_BASE_SELECT;

    if (address) {
      query +=
        ' AND (pasien.alamat LIKE ? OR kelurahan.nm_kel LIKE ? OR kecamatan.nm_kec LIKE ? OR kabupaten.nm_kab LIKE ? OR propinsi.nm_prop LIKE ?)';
      params.push(...Array(5).fill(`%${address}%`));
    }

    if (search) {
      query +=
        ' AND (pasien.no_rkm_medis LIKE ? OR pasien.nm_pasien LIKE ? OR pasien.no_ktp LIKE ? OR pasien.no_peserta LIKE ? OR pasien.namakeluarga LIKE ?)';
      params.push(...Array(5).fill(`%${search}%`));
    }

    query += orderClause;

    if (limit) {
      query += ' LIMIT ?';
      params.push(Number.parseInt(limit, 10) || 100);
    }
  }

  const [rows] = await db.query(query, params);
  return rows;
};

exports.findByNoRm = async (noRkmMedis) => {
  const [rows] = await db.query('SELECT * FROM pasien WHERE no_rkm_medis = ?', [noRkmMedis]);
  return rows;
};
