const { Company } = require('../models');
const AppError = require('../utils/AppError');

/**
 * GET /settings
 */
exports.getSettings = async (req, res, next) => {
  try {
    const company = await Company.findOne({ where: { adminId: req.user.id } });

    res.json({
      success: true,
      data: {
        company: company
          ? {
              id: company.id,
              name: company.name,
              description: company.description,
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
 * PUT /settings/company
 */
exports.updateCompany = async (req, res, next) => {
  try {
    let company = await Company.findOne({ where: { adminId: req.user.id } });

    if (!company) {
      company = await Company.create({ adminId: req.user.id });
    }

    const { name, description, email, phoneNumber, address } = req.body;

    if (phoneNumber && !/^\+234(?:70[1-9]|80[2-9]|81[0-8]|90[1-9]|91[1-356]|702[5-9])\d{7}$/.test(phoneNumber)) {
      throw new AppError('Phone number must be a valid Nigerian number starting with +234', 400);
    }
    if (address && (typeof address !== 'object' || !address.state || !address.lga || !address.settlement || !address.street)) {
      throw new AppError('Address must include state, lga, settlement, and street', 400);
    }

    if (name) company.name = name;
    if (description) company.description = description;
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
          description: company.description,
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
