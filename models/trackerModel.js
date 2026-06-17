const db = require('../config/db');

const simpanLogDB = async (userKode, ipAddress, url, method) => {
  try {
    const sql = 'INSERT INTO trackersql (tanggal, sqle, usere) VALUES (NOW(), ?, ?)';
    const detail = `${ipAddress} ${method} ${url}`;
    await db.query(sql, [detail, userKode]);
  } catch (error) {
    console.error('Gagal menyimpan tracker:', error);
  }
};

module.exports = { simpanLogDB };
