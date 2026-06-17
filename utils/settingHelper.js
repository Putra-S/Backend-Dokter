const db = require('../config/db');
const { logger } = require('../middleware/logger');

let cachedSetting = null;
let lastFetch = 0;
const CACHE_TTL = 1000 * 60 * 60;

async function getSetting() {
  const now = Date.now();
  if (cachedSetting && now - lastFetch < CACHE_TTL) {
    return cachedSetting;
  }

  try {
    const [rows] = await db.query(`
      SELECT 
        nama_instansi, alamat_instansi, kabupaten, propinsi, kontak, email, 
        kode_ppk, kode_ppkinhealth, kode_ppkkemenkes
      FROM setting 
      LIMIT 1
    `);

    if (rows.length > 0) {
      const data = rows[0];

      data.satusehat_organization_id =
        data.satusehat_organization_id || process.env.SATUSEHAT_ORGANIZATION_ID || '';
      data.fax = data.fax || '';

      cachedSetting = data;
      lastFetch = now;
      return cachedSetting;
    }
    return null;
  } catch (error) {
    logger.error('Error fetching setting:', error.message);
    return cachedSetting;
  }
}

function clearCache() {
  cachedSetting = null;
  lastFetch = 0;
}

module.exports = {
  getSetting,
  clearCache,
};
