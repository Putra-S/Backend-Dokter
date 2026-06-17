const os = require('node:os');
const { logger } = require('./logger');
const { simpanLogDB } = require('../models/trackerModel');

const getLocalIPv4 = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
};

const trackerMiddleware = async (c, next) => {
  const user = c.get('user') || {};
  const userKode = user.kode || 'UnknownUser';

  let ip = c.req.header('x-forwarded-for') || '127.0.0.1';
  ip = ip
    .split(',')[0]
    .trim()
    .replace(/^::ffff:/, '');
  if (ip === '127.0.0.1') {
    ip = getLocalIPv4();
  }

  const url = c.req.path;
  const method = c.req.method;

  const logMessage = `[TRACKER] User: ${userKode} | IP: ${ip} | Method: ${method} | URL: ${url}`;
  logger.info(logMessage);

  simpanLogDB(userKode, ip, url, method).catch((err) => {
    logger.error('[Tracker] Gagal menyimpan tracker:', err.message);
  });

  await next();
};

module.exports = { trackerMiddleware };
