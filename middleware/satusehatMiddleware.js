const templates = require('../data/satusehatTemplates.json');

const satusehatMiddleware = {
  getRawatJalan: (resourceType, caseName) => {
    return templates.RawatJalan?.[resourceType]?.[caseName] || null;
  },

  getRawatInap: (resourceType, caseName) => {
    return templates.RawatInap?.[resourceType]?.[caseName] || null;
  },

  templates,
};

module.exports = satusehatMiddleware;
