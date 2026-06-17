const db = require('../../../config/db');
const validateParams = require('../../../middleware/validateParams');
const response = require('../../../middleware/responseHandler');
const responseHandler = require('../../../middleware/responseHandler');

exports.getBilling = async (req, res) => {
  const { no_rawat } = req.query;

  const queryParams = { no_rawat };
  const validateErrors = validateParams(req, res, queryParams);
  if (validateErrors) return;

  const query = `SELECT
          billing.NO,
          billing.nm_perawatan,
          billing.pemisah,
      IF
          ( billing.biaya = 0, '', billing.biaya ) as biaya,
      IF
          ( billing.jumlah = 0, '', billing.jumlah ) as jumlah,
      IF
          ( billing.tambahan = 0, '', billing.tambahan ) as tambahan,
      IF
          ( billing.totalbiaya = 0, '', billing.totalbiaya ) as total_biaya,
          billing.totalbiaya
      FROM
          billing
      WHERE
          billing.no_rawat=?`;

  const [rows] = await db.query(query, [no_rawat]);

  if (rows.length === 0) {
    return response.noContent(res);
  }

  return response.ok(res, rows);
};

exports.getTotalBiaya = async (req, res) => {
  const { no_rawat } = req.query;

  if (validateParams(req, res, { no_rawat })) return;

  const consolidatedQuery = `
    SELECT 'registrasi' as kategori, biaya_reg as total FROM reg_periksa WHERE no_rawat = ?
    UNION ALL SELECT 'ralan_dr', IFNULL(sum(biaya_rawat), 0) FROM rawat_jl_dr WHERE no_rawat = ?
    UNION ALL SELECT 'ralan_pr', IFNULL(sum(biaya_rawat), 0) FROM rawat_jl_pr WHERE no_rawat = ?
    UNION ALL SELECT 'ralan_drpr', IFNULL(sum(biaya_rawat), 0) FROM rawat_jl_drpr WHERE no_rawat = ?
    UNION ALL SELECT 'ranap_dr', IFNULL(sum(biaya_rawat), 0) FROM rawat_inap_dr WHERE no_rawat = ?
    UNION ALL SELECT 'ranap_pr', IFNULL(sum(biaya_rawat), 0) FROM rawat_inap_pr WHERE no_rawat = ?
    UNION ALL SELECT 'ranap_drpr', IFNULL(sum(biaya_rawat), 0) FROM rawat_inap_drpr WHERE no_rawat = ?
    UNION ALL SELECT 'operasi', IFNULL(sum(
        IFNULL(biayaoperator1,0) + IFNULL(biayaoperator2,0) + IFNULL(biayaoperator3,0) +
        IFNULL(biayaasisten_operator1,0) + IFNULL(biayaasisten_operator2,0) + IFNULL(biayaasisten_operator3,0) +
        IFNULL(biayainstrumen,0) + IFNULL(biayadokter_anak,0) + IFNULL(biayaperawaat_resusitas,0) +
        IFNULL(biayadokter_anestesi,0) + IFNULL(biayaasisten_anestesi,0) + IFNULL(biayaasisten_anestesi2,0) +
        IFNULL(biayabidan,0) + IFNULL(biayabidan2,0) + IFNULL(biayabidan3,0) +
        IFNULL(biayaperawat_luar,0) + IFNULL(biayaalat,0) + IFNULL(biayasewaok,0) +
        IFNULL(akomodasi,0) + IFNULL(bagian_rs,0) +
        IFNULL(biaya_omloop,0) + IFNULL(biaya_omloop2,0) + IFNULL(biaya_omloop3,0) + IFNULL(biaya_omloop4,0) + IFNULL(biaya_omloop5,0) +
        IFNULL(biayasarpras,0) + IFNULL(biaya_dokter_pjanak,0) + IFNULL(biaya_dokter_umum,0)
    ), 0) FROM operasi WHERE no_rawat = ?
    UNION ALL SELECT 'kamar', IFNULL(sum(ttl_biaya), 0) FROM kamar_inap WHERE no_rawat = ?
    UNION ALL SELECT 'lab1', IFNULL(sum(biaya), 0) FROM periksa_lab WHERE no_rawat = ?
    UNION ALL SELECT 'lab2', IFNULL(sum(biaya_item), 0) FROM detail_periksa_lab WHERE no_rawat = ?
    UNION ALL SELECT 'radiologi', IFNULL(sum(biaya), 0) FROM periksa_radiologi WHERE no_rawat = ?
    UNION ALL SELECT 'obat1', IFNULL(sum(total), 0) FROM detail_pemberian_obat WHERE no_rawat = ?
    UNION ALL SELECT 'obat2', IFNULL(sum(besar_tagihan), 0) FROM tagihan_obat_langsung WHERE no_rawat = ?
    UNION ALL SELECT 'obat3', IFNULL(sum(hargasatuan * jumlah), 0) FROM beri_obat_operasi WHERE no_rawat = ?
    UNION ALL SELECT 'harian', IFNULL(sum(biaya_harian.jml * biaya_harian.besar_biaya * kamar_inap.lama), 0) 
              FROM kamar_inap INNER JOIN biaya_harian ON kamar_inap.kd_kamar = biaya_harian.kd_kamar WHERE kamar_inap.no_rawat = ?
    UNION ALL SELECT 'retur', IFNULL(sum(subtotal), 0) FROM detreturjual WHERE no_retur_jual LIKE CONCAT('%', ?, '%')
    UNION ALL SELECT 'resep_pulang', IFNULL(sum(total), 0) FROM resep_pulang WHERE no_rawat = ?
    UNION ALL SELECT 'deposit', IFNULL(sum(besar_deposit), 0) FROM deposit WHERE no_rawat = ?
    UNION ALL SELECT 'tambahan', IFNULL(sum(besar_biaya), 0) FROM tambahan_biaya WHERE no_rawat = ?
    UNION ALL SELECT 'potongan', IFNULL(sum(besar_pengurangan), 0) FROM pengurangan_biaya WHERE no_rawat = ?
  `;

  const params = Array(21).fill(no_rawat);
  const [rows] = await db.query(consolidatedQuery, params);

  const resultsMap = {};
  rows.forEach((row) => {
    resultsMap[row.kategori] = Number.parseFloat(row.total) || 0;
  });

  const biayaReg = resultsMap.registrasi;
  const totalRalan = resultsMap.ralan_dr + resultsMap.ralan_pr + resultsMap.ralan_drpr;
  const totalRanap = resultsMap.ranap_dr + resultsMap.ranap_pr + resultsMap.ranap_drpr;
  const totalOperasi = resultsMap.operasi;
  const totalKamar = resultsMap.kamar;
  const totalLab = resultsMap.lab1 + resultsMap.lab2;
  const totalRad = resultsMap.radiologi;
  const totalObat = resultsMap.obat1 + resultsMap.obat2 + resultsMap.obat3;
  const totalHarian = resultsMap.harian;
  const totalRetur = resultsMap.retur;
  const totalResepPulang = resultsMap.resep_pulang;
  const totalDeposit = resultsMap.deposit;
  const totalTambahan = resultsMap.tambahan;
  const totalPotongan = resultsMap.potongan;

  const grandTotal =
    biayaReg +
    totalRalan +
    totalRanap +
    totalOperasi +
    totalKamar +
    totalLab +
    totalRad +
    totalObat +
    totalHarian +
    totalResepPulang +
    totalTambahan -
    (totalRetur + totalPotongan);

  const sisaTagihan = grandTotal - totalDeposit;

  const data = {
    no_rawat,
    rincian: {
      registrasi: biayaReg,
      tindakan_ralan: totalRalan,
      tindakan_ranap: totalRanap,
      operasi: totalOperasi,
      kamar: totalKamar,
      laboratorium: totalLab,
      radiologi: totalRad,
      obat: totalObat,
      biaya_harian: totalHarian,
      resep_pulang: totalResepPulang,
      retur_obat: totalRetur,
      deposit: totalDeposit,
      tambahan: totalTambahan,
      potongan: totalPotongan,
    },
    total_biaya: grandTotal,
    sisa_tagihan: sisaTagihan,
  };

  return responseHandler.ok(res, data);
};
