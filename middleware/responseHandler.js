const { logMessage } = require('./logger');

const responseHandler = {
  ok: (res, data, message = 'Request berhasil', extra = {}) => {
    return res.status(200).json({
      code: 200,
      success: true,
      message: message?.message || message,
      data,
      ...extra,
    });
  },

  okPagination: (res, data, pagination, message = 'Request berhasil', extra = {}) => {
    return res.status(200).json({
      code: 200,
      success: true,
      message: message?.message || message,
      data,
      pagination: {
        current_page: pagination.currentPage || pagination.current_page || 1,
        per_page: pagination.perPage || pagination.per_page || 10,
        total: pagination.total || 0,
        last_page: pagination.lastPage || pagination.last_page || 1,
        next_page_url: pagination.nextPageUrl || pagination.next_page_url || null,
        prev_page_url: pagination.prevPageUrl || pagination.prev_page_url || null,
      },
      ...extra,
    });
  },

  created: (res, data, message = 'Data berhasil disimpan', extra = {}) => {
    return res.status(201).json({
      code: 201,
      success: true,
      message: message?.message || message,
      data,
      ...extra,
    });
  },

  failedSave: (res, message = 'Gagal menyimpan data') => {
    return res.status(400).json({
      code: 400,
      success: false,
      message: message?.message || message,
    });
  },

  failedUpdate: (res, message = 'Gagal mengupdate data') => {
    return res.status(400).json({
      code: 400,
      success: false,
      message: message?.message || message,
    });
  },

  failedDelete: (res, message = 'Gagal menghapus data') => {
    return res.status(400).json({
      code: 400,
      success: false,
      message: message?.message || message,
    });
  },

  noContent: (res, message = 'Data tidak ditemukan') => {
    return res.status(200).json({
      code: 200,
      success: true,
      message: message?.message || message,
      data: [],
    });
  },

  badRequest: (reqOrRes, resOrMsg, msgIfReqExists) => {
    let req = null;
    let res = null;
    let message = '';

    if (resOrMsg?.status && typeof resOrMsg.status === 'function') {
      req = reqOrRes;
      res = resOrMsg;
      message = msgIfReqExists || 'Bad request';
    } else {
      res = reqOrRes;
      message = resOrMsg || 'Bad request';
    }

    const ip = req
      ? req.ip ||
        req.headers['x-forwarded-for'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        '-'
      : '-';
    const method = req ? req.method : '-';
    const url = req ? req.originalUrl || req.url : '-';

    const infoMessage = `ip= ${ip} method= ${method} url= ${url} code= 400`;

    const errorMessage = `${message?.message || message}`;
    logMessage('error', `${infoMessage} ${errorMessage}`);

    return res.status(400).json({
      code: 400,
      success: false,
      message: message?.message || message,
    });
  },

  badRequestDetail: (reqOrRes, resOrMsg, msgIfReqExists) => {
    let req = null;
    let res = null;
    let message = null;

    if (resOrMsg?.status && typeof resOrMsg.status === 'function') {
      req = reqOrRes;
      res = resOrMsg;
      message = msgIfReqExists || 'Bad request';
    } else {
      res = reqOrRes;
      message = resOrMsg || 'Bad request';
    }

    const ip = req
      ? req.ip ||
        req.headers['x-forwarded-for'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        '-'
      : '-';
    const method = req ? req.method : '-';
    const url = req ? req.originalUrl || req.url : '-';

    const infoMessage = `ip= ${ip} method= ${method} url= ${url} code= 400`;

    const msgText = typeof message === 'object' && message.message ? message.message : message;
    const details = typeof message === 'object' && message.details ? message.details : undefined;

    const errorMessage = `${msgText}${details ? ` | details: ${details.join(', ')}` : ''}`;
    logMessage('error', `${infoMessage} ${errorMessage}`);

    const responsePayload = {
      code: 400,
      success: false,
      message: msgText,
    };

    if (details) {
      responsePayload.details = details;
    }

    return res.status(400).json(responsePayload);
  },

  unauthorized: (res, error, message = 'Unauthorized') => {
    return res.status(401).json({
      code: 401,
      success: false,
      message: message?.message || message,
      error: error?.message || error,
    });
  },

  forbidden: (res, message = 'Forbidden') => {
    return res.status(403).json({
      code: 403,
      success: false,
      message: message?.message || message,
    });
  },

  notFound: (res, message = 'Resource tidak ditemukan') => {
    return res.status(404).json({
      code: 404,
      success: false,
      message: message?.message || message,
    });
  },

  conflict: (res, message = 'Conflict') => {
    return res.status(409).json({
      code: 409,
      success: false,
      message: message?.message || message,
    });
  },

  internalError: (reqOrRes, resOrErr, errorOrMsg, msgIfReqExists) => {
    let req = null;
    let res = null;
    let error = null;
    let message = 'Internal server error';

    if (resOrErr?.status && typeof resOrErr.status === 'function') {
      req = reqOrRes;
      res = resOrErr;
      error = errorOrMsg;
      message = msgIfReqExists || 'Internal server error';
    } else {
      res = reqOrRes;
      error = resOrErr;
      message = errorOrMsg || 'Internal server error';
    }

    const ip = req
      ? req.ip ||
        req.headers?.['x-forwarded-for'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        '-'
      : '-';
    const method = req ? req.method : '-';
    const url = req ? req.originalUrl || req.url : '-';

    const infoMessage = `ip= ${ip} method= ${method} url= ${url} code= 500`;

    const errorMessage = `${message}: ${error?.message || error}`;
    logMessage('error', `${infoMessage} ${errorMessage}`);

    const isProduction = process.env.NODE_ENV === 'production';

    return res.status(500).json({
      code: 500,
      success: false,
      message,
      error: isProduction ? 'Terjadi kesalahan pada server' : error?.message || error,
    });
  },
};

module.exports = responseHandler;
