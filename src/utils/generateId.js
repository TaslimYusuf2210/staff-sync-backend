const { v4: uuidv4 } = require('uuid');

/**
 * Generate a short unique ID with a prefix.
 * @param {string} prefix - e.g. 'emp', 'dep', 'edu', 'doc', 'n', 'comp'
 * @returns {string} e.g. 'emp-a1b2c3d4'
 */
const generateId = (prefix) => {
  const short = uuidv4().split('-')[0];
  return `${prefix}-${short}`;
};

module.exports = generateId;
