const db = require('../config/db');
const cache = require('./cache');

const REFERENCE_TTL = 300;

const getCachedMap = async (key, sql, mapKey, mapValue) => {
  let pairs = await cache.remember(
    `ref:${key}`,
    async () => {
      const [rows] = await db.query(sql);
      return rows.map((r) => [r[mapKey], r[mapValue]]);
    },
    REFERENCE_TTL
  );

  if (!Array.isArray(pairs)) {
    pairs = [];
  }

  return new Map(pairs);
};

const getCachedRows = async (key, sql, params = []) => {
  return cache.remember(
    `ref:${key}`,
    async () => {
      const [rows] = await db.query(sql, params);
      return rows;
    },
    REFERENCE_TTL
  );
};

const getPenjabMap = () =>
  getCachedMap('penjab', 'SELECT kd_pj, png_jawab FROM penjab', 'kd_pj', 'png_jawab');

const getKelurahanMap = () =>
  getCachedMap('kelurahan', 'SELECT kd_kel, nm_kel FROM kelurahan', 'kd_kel', 'nm_kel');

const getKecamatanMap = () =>
  getCachedMap('kecamatan', 'SELECT kd_kec, nm_kec FROM kecamatan', 'kd_kec', 'nm_kec');

const getKabupatenMap = () =>
  getCachedMap('kabupaten', 'SELECT kd_kab, nm_kab FROM kabupaten', 'kd_kab', 'nm_kab');

const getPropinsiMap = () =>
  getCachedMap('propinsi', 'SELECT kd_prop, nm_prop FROM propinsi', 'kd_prop', 'nm_prop');

const getSukuBangsaMap = () =>
  getCachedMap(
    'suku_bangsa',
    'SELECT id, nama_suku_bangsa FROM suku_bangsa',
    'id',
    'nama_suku_bangsa'
  );

const getBahasaMap = () =>
  getCachedMap('bahasa', 'SELECT id, nama_bahasa FROM bahasa_pasien', 'id', 'nama_bahasa');

const getCacatFisikMap = () =>
  getCachedMap('cacat_fisik', 'SELECT id, nama_cacat FROM cacat_fisik', 'id', 'nama_cacat');

const getPoliklinikMap = () =>
  getCachedMap('poliklinik', 'SELECT kd_poli, nm_poli FROM poliklinik', 'kd_poli', 'nm_poli');

const getDokterMap = () =>
  getCachedMap('dokter', 'SELECT kd_dokter, nm_dokter FROM dokter', 'kd_dokter', 'nm_dokter');

const getBangsalMap = () =>
  getCachedMap('bangsal', 'SELECT kd_bangsal, nm_bangsal FROM bangsal', 'kd_bangsal', 'nm_bangsal');

const getAllMaps = async () => {
  const [penjabMap, kelMap, kecMap, kabMap, propMap, sukuMap, bahasaMap, cacatMap] =
    await Promise.all([
      getPenjabMap(),
      getKelurahanMap(),
      getKecamatanMap(),
      getKabupatenMap(),
      getPropinsiMap(),
      getSukuBangsaMap(),
      getBahasaMap(),
      getCacatFisikMap(),
    ]);

  return { penjabMap, kelMap, kecMap, kabMap, propMap, sukuMap, bahasaMap, cacatMap };
};

const getExtendedMaps = async () => {
  const [base, poliMap, dokterMap] = await Promise.all([
    getAllMaps(),
    getPoliklinikMap(),
    getDokterMap(),
  ]);

  return { ...base, poliMap, dokterMap };
};

const invalidateAll = () => {
  cache.delByPrefix('ref:');
};

const invalidate = (key) => {
  cache.del(`ref:${key}`);
};

module.exports = {
  getCachedMap,
  getCachedRows,
  getPenjabMap,
  getKelurahanMap,
  getKecamatanMap,
  getKabupatenMap,
  getPropinsiMap,
  getSukuBangsaMap,
  getBahasaMap,
  getCacatFisikMap,
  getPoliklinikMap,
  getDokterMap,
  getBangsalMap,
  getAllMaps,
  getExtendedMaps,
  invalidateAll,
  invalidate,
};
