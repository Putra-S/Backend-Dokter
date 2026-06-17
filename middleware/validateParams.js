const response = require('../middleware/responseHandler');

function validateParams(req, res, fields) {
  const errors = [];

  for (const [key, value] of Object.entries(fields)) {
    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0);

    if (isEmpty) {
      errors.push(`Field ${key} wajib diisi`);
    }
  }

  if (errors.length > 0) {
    return response.badRequest(req, res, errors.join(', '));
  }

  return null;
}

function validateParamsAdvanced(req, res, schema) {
  const errors = [];

  for (const [key, rules] of Object.entries(schema)) {
    const value = req.body?.[key] ?? req.query?.[key] ?? req.params?.[key];

    if (rules.required !== false) {
      const isEmpty =
        value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

      if (isEmpty) {
        errors.push(`${rules.label || key} wajib diisi`);
        continue;
      }
    } else if (value === undefined || value === null || value === '') {
      continue;
    }

    if (rules.type) {
      switch (rules.type) {
        case 'number':
          if (Number.isNaN(Number(value))) {
            errors.push(`${rules.label || key} harus berupa angka`);
          } else {
            const num = Number(value);
            if (rules.min !== undefined && num < rules.min) {
              errors.push(`${rules.label || key} minimal ${rules.min}`);
            }
            if (rules.max !== undefined && num > rules.max) {
              errors.push(`${rules.label || key} maksimal ${rules.max}`);
            }
          }
          break;

        case 'date':
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            errors.push(`${rules.label || key} harus format YYYY-MM-DD`);
          }
          break;

        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(`${rules.label || key} format email tidak valid`);
          }
          break;

        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${rules.label || key} harus berupa teks`);
          }
          break;
      }
    }

    if (typeof value === 'string') {
      if (rules.minLength && value.trim().length < rules.minLength) {
        errors.push(`${rules.label || key} minimal ${rules.minLength} karakter`);
      }
      if (rules.maxLength && value.trim().length > rules.maxLength) {
        errors.push(`${rules.label || key} maksimal ${rules.maxLength} karakter`);
      }
    }

    if (rules.pattern && typeof value === 'string') {
      if (!rules.pattern.test(value)) {
        errors.push(`${rules.label || key} format tidak valid`);
      }
    }

    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${rules.label || key} harus salah satu dari: ${rules.enum.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    return response.badRequestDetail(req, res, {
      message: 'Validasi gagal',
      details: errors,
    });
  }

  return null;
}

module.exports = validateParams;
module.exports.validateParamsAdvanced = validateParamsAdvanced;
