const { Company } = require('../models');

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
