const crypto = require('node:crypto');

const requestIdMiddleware = async (c, next) => {
  const requestId = c.req.header('x-request-id') || generateRequestId();

  c.set('requestId', requestId);
  c.header('X-Request-Id', requestId);

  await next();
};

const generateRequestId = () => {
  const timestamp = Date.now().toString(16).slice(-8);
  const random = crypto.randomBytes(2).toString('hex');
  return `${timestamp}${random}`;
};

module.exports = requestIdMiddleware;
