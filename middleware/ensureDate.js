const dayjs = require('dayjs');

/**
 * Hono middleware — otomatis patch field tanggal di req.body (c.get('body'))
 * jika kosong/undefined, fallback ke waktu server saat ini.
 *
 * @param {string|string[]} fields - nama field yang perlu divalidasi
 * @param {string} format - format dayjs (default: 'YYYY-MM-DD HH:mm:ss')
 *
 * Usage di route:
 *   router.post('/save', ensureDate('tanggal'), auditTrail('...'), asyncHandler(controller.save));
 *   router.post('/save', ensureDate(['tanggal', 'tgl_registrasi']), auditTrail('...'), asyncHandler(controller.save));
 */
const ensureDate = (fields = 'tanggal', format = 'YYYY-MM-DD HH:mm:ss') => {
  const fieldList = Array.isArray(fields) ? fields : [fields];

  return async (c, next) => {
    const body = c.get('body');
    if (body) {
      for (const field of fieldList) {
        if (!body[field] || typeof body[field] !== 'string' || body[field].trim() === '') {
          body[field] = dayjs().format(format);
        }
      }
      c.set('body', body);
    }
    await next();
  };
};

module.exports = ensureDate;
