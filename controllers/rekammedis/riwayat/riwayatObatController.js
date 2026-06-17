const db = require('../../../config/db');
const validateParams = require('../../../middleware/validateParams');
const response = require('../../../middleware/responseHandler');

exports.getPemberianObat = async (req, res) => {
  const { no_rawat } = req.query;

  const queryParams = { no_rawat };
  const validateErrors = validateParams(req, res, queryParams);
  if (validateErrors) return;

  const query = `SELECT
    detail_pemberian_obat.tgl_perawatan,
    detail_pemberian_obat.jam,
    databarang.kode_sat,
    detail_pemberian_obat.kode_brng,
    detail_pemberian_obat.jml,
    detail_pemberian_obat.total,
    databarang.nama_brng,
    kodesatuan.satuan,
    aturan_pakai.aturan
  FROM
    detail_pemberian_obat
    INNER JOIN
    databarang
    ON
      detail_pemberian_obat.kode_brng = databarang.kode_brng
    INNER JOIN
    kodesatuan
    ON
      databarang.kode_sat = kodesatuan.kode_sat
    LEFT JOIN
    aturan_pakai
    ON
      detail_pemberian_obat.tgl_perawatan = aturan_pakai.tgl_perawatan AND
      detail_pemberian_obat.jam = aturan_pakai.jam AND
      detail_pemberian_obat.no_rawat = aturan_pakai.no_rawat AND
      detail_pemberian_obat.kode_brng = aturan_pakai.kode_brng
  WHERE
    detail_pemberian_obat.no_rawat = ?
  ORDER BY
    detail_pemberian_obat.tgl_perawatan ASC,
    detail_pemberian_obat.jam ASC`;

  const [rows] = await db.query(query, [no_rawat]);
  const total_biaya = rows.reduce((acc, curr) => acc + (Number.parseFloat(curr.total) || 0), 0);

  if (rows.length === 0) {
    return response.noContent(res);
  }
  const retur = await getReturObat(no_rawat, req, res);
  const result = await Promise.all(
    rows.map(async (item) => {
      return {
        ...item,
      };
    })
  );
  const formattedResult = [...result, { retur: retur.rows, total_retur: retur.total_biaya }];
  return response.ok(res, { list: formattedResult, total_biaya: total_biaya });
};

async function getReturObat(no_rawat, req, res) {
  try {
    const query = `SELECT
            databarang.kode_brng,
            databarang.nama_brng,
            detreturjual.kode_sat,
            detreturjual.h_retur,
            ( detreturjual.jml_retur * - 1 ) AS jumlah,(
                detreturjual.subtotal * - 1
            ) AS total
        FROM
            detreturjual
            INNER JOIN databarang ON detreturjual.kode_brng = databarang.kode_brng
            INNER JOIN returjual ON returjual.no_retur_jual = detreturjual.no_retur_jual
        WHERE
            returjual.no_retur_jual LIKE '%${no_rawat}%'
        ORDER BY
            databarang.nama_brng`;

    const [rows] = await db.query(query);
    const total_biaya = rows.reduce((acc, curr) => acc + (Number.parseFloat(curr.total) || 0), 0);
    return { rows, total_biaya };
  } catch (err) {
    return response.internalError(req, res, err);
  }
}

exports.getResepPulang = async (req, res) => {
  const { no_rawat } = req.query;

  const queryParams = { no_rawat };
  const validateErrors = validateParams(req, res, queryParams);
  if (validateErrors) return;

  const query = `SELECT
    resep_pulang.kode_brng,
    databarang.nama_brng,
    resep_pulang.dosis,
    resep_pulang.jml_barang,
    databarang.kode_sat,
    kodesatuan.satuan,
    resep_pulang.total
  FROM
    resep_pulang
    INNER JOIN
    databarang
    ON
      resep_pulang.kode_brng = databarang.kode_brng
    INNER JOIN
    kodesatuan
    ON
      databarang.kode_sat = kodesatuan.kode_sat
  WHERE
    resep_pulang.no_rawat = ?
  ORDER BY
    databarang.nama_brng ASC`;

  const [rows] = await db.query(query, [no_rawat]);
  const total_biaya = rows.reduce((acc, curr) => acc + (Number.parseFloat(curr.total) || 0), 0);

  if (rows.length === 0) {
    return response.noContent(res);
  }
  return response.ok(res, { list: rows, total_biaya: total_biaya });
};
