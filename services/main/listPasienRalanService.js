const { calculateAge } = require('../../utils/dateHelper');
const { buildOrderClause } = require('../../utils/paginationHelper');
const cache = require('../../utils/cache');
const regPeriksaRepo = require('../../repositories/regPeriksaRepository');

const ALIAS_MAP = {
  status_bayar: 'reg_periksa.status_bayar',
  status_periksa: 'reg_periksa.status_periksa',
  nm_pasien: 'pasien.nm_pasien',
  nm_dokter: 'dokter.nm_dokter',
  nm_poli: 'poliklinik.nm_poli',
  no_tlp: 'pasien.no_tlp',
  tgl_lahir: 'pasien.tgl_lahir',
  no_peserta: 'pasien.no_peserta',
  no_ktp: 'pasien.no_ktp',
  no_rawat: 'reg_periksa.no_rawat',
  no_reg: 'reg_periksa.no_reg',
  tgl_registrasi: 'reg_periksa.tgl_registrasi',
  jam_reg: 'reg_periksa.jam_reg',
  kd_dokter: 'reg_periksa.kd_dokter',
  no_rkm_medis: 'reg_periksa.no_rkm_medis',
  almt_pj: 'reg_periksa.almt_pj',
  hubunganpj: 'reg_periksa.hubunganpj',
  biaya_reg: 'reg_periksa.biaya_reg',
  stts: 'reg_periksa.stts',
  umur: 'reg_periksa.umurdaftar',
  status_poli: 'reg_periksa.status_poli',
  kd_pj: 'reg_periksa.kd_pj',
  kd_poli: 'reg_periksa.kd_poli',
};

const parseGroupConcatArray = (str, separator = '||') => {
  if (!str) return [];
  return str.split(separator).filter(Boolean);
};

const parseGroupConcatMap = (str, itemSeparator = '||', keyValueSeparator = ':') => {
  if (!str) return [];
  const items = str.split(itemSeparator);
  const result = [];
  for (const item of items) {
    if (!item) continue;
    const idx = item.indexOf(keyValueSeparator);
    if (idx === -1) continue;
    const key = item.substring(0, idx);
    const value = item.substring(idx + 1);
    result.push({ key, value });
  }
  return result;
};

exports.getListPasienRalan = async (queryObject) => {
  const { statusbayar, statusperiksa, poli, dokter, tglawal, tglakhir, search, orderby, sort } =
    queryObject;

  const orderClause = buildOrderClause(
    orderby,
    sort,
    ALIAS_MAP,
    'reg_periksa.tgl_registrasi, reg_periksa.jam_reg'
  );

  const cacheKey = `list_pasien_ralan_${JSON.stringify(queryObject)}`;

  const rowsWithSEP = await cache.remember(
    cacheKey,
    async () => {
      const rows = await regPeriksaRepo.getListPasienRalan(
        tglawal,
        tglakhir,
        statusbayar,
        statusperiksa,
        poli,
        dokter,
        search,
        orderClause
      );

      if (rows.length === 0) return [];

      return rows.map((row) => {
        const sep = parseGroupConcatArray(row.sep_list);
        const diagnosa = parseGroupConcatMap(row.diagnosa_list).map((item) => ({
          kd_penyakit: item.key,
          nm_penyakit: item.value,
        }));

        const newRow = { ...row };
        delete newRow.sep_list;
        delete newRow.diagnosa_list;

        return {
          ...newRow,
          usia: calculateAge(row.tgl_lahir),
          sep,
          diagnosa,
        };
      });
    },
    5
  );

  return rowsWithSEP;
};
