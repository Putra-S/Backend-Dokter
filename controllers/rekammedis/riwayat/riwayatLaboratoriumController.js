const db = require('../../../config/db');
const validateParams = require('../../../middleware/validateParams');
const response = require('../../../middleware/responseHandler');

exports.getLaboratorium = async (req, res) => {
  const { no_rawat } = req.query;
  if (validateParams(req, res, { no_rawat })) return;

  const [periksaRows] = await db.query(
    `
    SELECT ridp.tgl_periksa, ridp.jam, ridp.kd_jenis_prw, jpi.nm_perawatan, p.nama, ridp.biaya, ridp.dokter_perujuk, d.nm_dokter
    FROM periksa_lab ridp
    INNER JOIN jns_perawatan_lab jpi ON ridp.kd_jenis_prw = jpi.kd_jenis_prw
    INNER JOIN petugas p ON ridp.nip = p.nip
    INNER JOIN dokter d ON ridp.kd_dokter = d.kd_dokter
    WHERE ridp.kategori <> 'PA' AND ridp.no_rawat = ?
    ORDER BY ridp.tgl_periksa DESC, ridp.jam DESC`,
    [no_rawat]
  );

  if (periksaRows.length === 0) return response.noContent(res);

  const [nilaiRows] = await db.query(
    `
    SELECT dpl.no_rawat, dpl.kd_jenis_prw, dpl.tgl_periksa, dpl.jam, tl.Pemeriksaan, dpl.nilai, tl.satuan, dpl.nilai_rujukan, dpl.biaya_item, dpl.keterangan
    FROM detail_periksa_lab dpl
    INNER JOIN template_laboratorium tl ON dpl.id_template = tl.id_template
    WHERE dpl.no_rawat = ?
    ORDER BY tl.urut`,
    [no_rawat]
  );

  const [saranRows] = await db.query(
    'SELECT tgl_periksa, jam, saran, kesan FROM saran_kesan_lab WHERE no_rawat = ?',
    [no_rawat]
  );

  const getGroupKey = (r) => `${r.tgl_periksa}_${r.jam}`;
  const getPeriksaKey = (r) => `${r.tgl_periksa}_${r.jam}_${r.kd_jenis_prw}`;

  const nilaiMap = nilaiRows.reduce((acc, curr) => {
    const key = getPeriksaKey(curr);
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {});

  const saranMap = saranRows.reduce((acc, curr) => {
    const key = getGroupKey(curr);
    acc[key] = { saran: curr.saran, kesan: curr.kesan };
    return acc;
  }, {});

  let total_biaya_all = 0;
  const groups = {};

  periksaRows.forEach((p) => {
    const groupKey = getGroupKey(p);
    const periksaKey = getPeriksaKey(p);

    if (!groups[groupKey]) {
      groups[groupKey] = {
        tgl_periksa: p.tgl_periksa,
        jam: p.jam,
        periksa: [],
        saran: saranMap[groupKey] ? [saranMap[groupKey]] : [],
      };
    }

    total_biaya_all += Number.parseFloat(p.biaya) || 0;
    const nilai = nilaiMap[periksaKey] || [];
    nilai.forEach((n) => {
      total_biaya_all += Number.parseFloat(n.biaya_item) || 0;
    });

    groups[groupKey].periksa.push({ ...p, nilai });
  });

  const result = Object.values(groups).sort((a, b) => {
    if (a.tgl_periksa !== b.tgl_periksa) return b.tgl_periksa.localeCompare(a.tgl_periksa);
    return b.jam.localeCompare(a.jam);
  });

  return response.ok(res, {
    list: result,
    total_biaya: total_biaya_all,
  });
};

exports.getLaboratoriumPa = async (req, res) => {
  const { no_rawat } = req.query;
  if (validateParams(req, res, { no_rawat })) return;

  const [rows] = await db.query(
    `
    SELECT pl.tgl_periksa, pl.jam, pl.kd_jenis_prw, jpl.nm_perawatan, p.nama, pl.biaya, pl.dokter_perujuk, d.nm_dokter
    FROM periksa_lab pl
    INNER JOIN jns_perawatan_lab jpl ON pl.kd_jenis_prw = jpl.kd_jenis_prw
    INNER JOIN petugas p ON pl.nip = p.nip
    INNER JOIN dokter d ON pl.kd_dokter = d.kd_dokter
    WHERE pl.kategori = 'PA' AND pl.no_rawat = ?
    ORDER BY pl.tgl_periksa DESC, pl.jam DESC`,
    [no_rawat]
  );

  if (rows.length === 0) return response.noContent(res);

  const [details] = await db.query(
    `SELECT kd_jenis_prw, tgl_periksa, jam, diagnosa_klinik, makroskopik, mikroskopik, kesimpulan, kesan
     FROM detail_periksa_labpa WHERE no_rawat = ?`,
    [no_rawat]
  );

  const detailMap = details.reduce((acc, curr) => {
    const key = `${curr.tgl_periksa}_${curr.jam}_${curr.kd_jenis_prw}`;
    acc[key] = curr;
    return acc;
  }, {});

  const result = rows.map((item) => {
    const key = `${item.tgl_periksa}_${item.jam}_${item.kd_jenis_prw}`;
    return { ...item, detail: detailMap[key] ? [detailMap[key]] : [] };
  });

  const total_biaya = rows.reduce((acc, curr) => acc + (Number.parseFloat(curr.biaya) || 0), 0);

  return response.ok(res, { list: result, total_biaya });
};
