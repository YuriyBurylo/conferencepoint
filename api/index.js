const { getJwtSecret } = require('../server/utils/security');

// Validate configuration when Vercel initializes the function.
getJwtSecret();

module.exports = require('../server');
