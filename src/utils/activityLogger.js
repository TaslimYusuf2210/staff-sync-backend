const { Activity } = require('../models');

/**
 * Log an activity for the dashboard's Recent Activity timeline.
 *
 * @param {object} params
 * @param {string} params.action - Human-readable action string (e.g. "You created employee John Doe")
 * @param {string} params.type  - Activity type enum: employee | employee_delete | department | department_edit | note | document | education | salary
 * @param {string} params.companyId - The company the activity belongs to
 * @returns {Promise<object>} The created Activity record
 */
const logActivity = async ({ action, type, companyId }) => {
  if (!action || !type || !companyId) {
    console.warn('activityLogger: missing required fields', { action, type, companyId });
    return null;
  }

  return Activity.create({ action, type, companyId });
};

module.exports = logActivity;
