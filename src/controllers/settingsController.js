const { Admin, Company } = require('../models');
const AppError = require('../utils/AppError');

/**
 * GET /settings
 */
exports.getSettings = async (req, res, next) => {
  try {
    const admin = await Admin.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'profilePicture'],
    });
    if (!admin) throw new AppError('Admin not found', 404);

    const company = await Company.findOne({ where: { adminId: req.user.id } });

    res.json({
      success: true,
      data: {
        admin: {
          name: admin.name,
          email: admin.email,
          profilePicture: admin.profilePicture,
        },
        company: company
          ? {
              name: company.name,
              email: company.email,
              phoneNumber: company.phoneNumber,
              address: company.address,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /settings/admin
 */
exports.updateAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findByPk(req.user.id);
    if (!admin) throw new AppError('Admin not found', 404);

    const { name, email, profilePicture } = req.body;
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (profilePicture !== undefined) admin.profilePicture = profilePicture;
    await admin.save();

    res.json({
      success: true,
      message: 'Admin profile updated successfully',
      data: {
        admin: {
          name: admin.name,
          email: admin.email,
          profilePicture: admin.profilePicture,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /settings/company
 */
exports.updateCompany = async (req, res, next) => {
  try {
    let company = await Company.findOne({ where: { adminId: req.user.id } });

    if (!company) {
      company = await Company.create({ adminId: req.user.id });
    }

    const { name, email, phoneNumber, address } = req.body;
    if (name) company.name = name;
    if (email) company.email = email;
    if (phoneNumber) company.phoneNumber = phoneNumber;
    if (address) company.address = address;
    await company.save();

    res.json({
      success: true,
      message: 'Company information updated successfully',
      data: {
        company: {
          name: company.name,
          email: company.email,
          phoneNumber: company.phoneNumber,
          address: company.address,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
