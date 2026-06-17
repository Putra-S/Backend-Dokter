const db = require('../config/db');
const { logger } = require('../middleware/logger');

const response = require('./responseHandler');

const billingCheck = (options = {}) => {
  const { source = 'body', field = 'no_rawat', lookupTable = null, lookupField = null } = options;

  return async (reqOrContext, resOrNext, maybeNext) => {
    let req = reqOrContext;
    let res = resOrNext;
    let next = maybeNext;

    // Check if we are running in Hono context
    const isHono = reqOrContext && typeof reqOrContext.json === 'function' && reqOrContext.req;

    if (isHono) {
      const c = reqOrContext;
      next = resOrNext; // In Hono, next is the second parameter
      
      const query = c.req.query() || {};
      const params = c.req.param() || {};
      const body = c.get('body') || {};
      const headers = c.req.header() || {};

      req = {
        query,
        params,
        body,
        headers,
        get: (headerName) => c.req.header(headerName),
        ip: c.req.header('x-forwarded-for') || '127.0.0.1',
        method: c.req.method,
        url: c.req.url,
        originalUrl: c.req.path,
        set: (key, val) => c.set(key, val),
        getVal: (key) => c.get(key),
      };

      res = {
        _status: 200,
        headersSent: false,
        _honoResponse: null,

        status(statusCode) {
          this._status = statusCode;
          return this;
        },
        json(obj) {
          this.headersSent = true;
          this._honoResponse = c.json(obj, this._status);
          return this._honoResponse;
        },
        send(data) {
          this.headersSent = true;
          this._honoResponse = c.text(data, this._status);
          return this._honoResponse;
        },
        end() {
          this.headersSent = true;
          this._honoResponse = c.body(null, this._status);
          return this._honoResponse;
        },
      };
    }

    try {
      let no_rawat = req[source]?.[field];

      if (!no_rawat) {
        const otherSource = source === 'body' ? 'query' : 'body';
        no_rawat = req[otherSource]?.[field];
      }

      if (!no_rawat) {
        return await next();
      }

      if (lookupTable && lookupField && field !== 'no_rawat') {
        const [lookup] = await db.query(
          `SELECT no_rawat FROM ${lookupTable} WHERE ${lookupField} = ? LIMIT 1`,
          [no_rawat]
        );

        if (lookup.length === 0) {
          const notFoundResponse = response.notFound(res, `Data pada ${lookupTable} tidak ditemukan`);
          return isHono ? notFoundResponse : undefined;
        }
        no_rawat = lookup[0].no_rawat;
      }

      const [cekData] = await db.query(
        `SELECT
          (SELECT COUNT(*) FROM billing WHERE no_rawat = ?) as jml_billing,
          (SELECT stts FROM reg_periksa WHERE no_rawat = ?) as status_reg`,
        [no_rawat, no_rawat]
      );

      if (cekData[0].status_reg === 'Batal') {
        const badRequestResponse = response.badRequest(
          req,
          res,
          'Status pendaftaran sudah BATAL. Tidak dapat melakukan perubahan data.'
        );
        return isHono ? badRequestResponse : undefined;
      }

      if (cekData[0].jml_billing > 0) {
        const badRequestResponse = response.badRequest(
          req,
          res,
          'Data billing sudah terverifikasi. Silahkan hubungi bagian kasir/keuangan ..!!'
        );
        return isHono ? badRequestResponse : undefined;
      }

      if (req.body?.billingCheckOnly || req.query?.billingCheckOnly) {
        const okResponse = response.ok(
          res,
          { no_rawat },
          'Verifikasi billing berhasil. Data aman untuk diproses.'
        );
        return isHono ? okResponse : undefined;
      }

      return await next();
    } catch (error) {
      logger.error('Billing Check Error:', error);
      const errResponse = response.internalError(req, res, error);
      if (isHono) return errResponse;
    }
  };
};

module.exports = billingCheck;
