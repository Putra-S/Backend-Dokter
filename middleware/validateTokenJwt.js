const jose = require('jose');
const response = require('../middleware/responseHandler');

if (!process.env.SECRETTOKEN) {
  throw new Error('[FATAL] SECRETTOKEN tidak di-set di .env! Server tidak boleh berjalan tanpa secret key.');
}

const secretKey = new TextEncoder().encode(process.env.SECRETTOKEN);

module.exports = async (c, next) => {
  const authHeader = c.req.header('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const res = {
      status(code) {
        this._status = code;
        return this;
      },
      json(obj) {
        return c.json(obj, this._status);
      },
    };
    return response.unauthorized(res, '', 'Token tidak ditemukan');
  }

  const token = authHeader.split(' ')[1];

  try {
    const { payload } = await jose.jwtVerify(token, secretKey);

    c.set('user', payload.data);
    await next();
  } catch (error) {
    const res = {
      status(code) {
        this._status = code;
        return this;
      },
      json(obj) {
        return c.json(obj, this._status);
      },
    };
    return response.unauthorized(res, error, 'Unauthorized Token Invalid or Expired');
  }
};
