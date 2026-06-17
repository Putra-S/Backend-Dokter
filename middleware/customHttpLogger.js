const { logger } = require('./logger');

const customHttpLogger = async (c, next) => {
  const start = Date.now();
  await next();
  const timeInMs = (Date.now() - start).toFixed(2);

  const method = c.req.method;
  const path = c.req.path;
  const status = c.res.status;
  const ip = c.req.header('x-forwarded-for') || '127.0.0.1';
  const requestId = c.get('requestId') || '-';

  const logMsg = `${method} ${path} [Status: ${status}] - ${timeInMs}ms | IP: ${ip} | ReqID: ${requestId}`;

  if (status >= 500) {
    logger.error(logMsg);
  } else if (status >= 400) {
    logger.warn(logMsg);
  } else {
    logger.info(logMsg);
  }
};

module.exports = customHttpLogger;
