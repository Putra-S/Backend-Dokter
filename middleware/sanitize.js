const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;

  return str

    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')

    .replace(/javascript\s*:/gi, '')

    .trim();
};

const BLACKLISTED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const sanitizeObject = (obj, depth = 0) => {
  if (depth > 10) return obj;
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') return sanitizeString(obj);
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => sanitizeObject(item, depth + 1));

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (BLACKLISTED_KEYS.has(key)) continue;
    sanitized[key] = sanitizeObject(value, depth + 1);
  }
  return sanitized;
};

const sanitizeMiddleware = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
};

module.exports = sanitizeMiddleware;
module.exports.sanitizeString = sanitizeString;
module.exports.sanitizeObject = sanitizeObject;
