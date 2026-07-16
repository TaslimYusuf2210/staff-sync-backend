const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');
const { Admin, Company } = require('../models');

/**
 * JWT authentication middleware.
 * Verifies the Bearer token and attaches the admin user and company to req.user.
 */
const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const admin = await Admin.findByPk(decoded.id);
    if (!admin) {
      throw new AppError('Admin not found', 401);
    }

    // Fetch the company associated with this admin
    const company = await Company.findOne({ where: { adminId: admin.id } });

    req.user = admin;
    req.user.companyId = company?.id || null;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token', 401));
    }
    next(error);
  }
};

module.exports = authenticate;
