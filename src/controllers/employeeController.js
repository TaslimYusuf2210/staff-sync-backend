const { Op } = require('sequelize');
const { Employee, Department, Education, Salary, BankAccount, Document, Note } = require('../models');
const AppError = require('../utils/AppError');
const { generateEmployeeId } = require('../utils/generateId');

// ─── Include helper ─────────────────────────────────────────

const fullInclude = [
  { model: Education },
  { model: Salary },
  { model: BankAccount },
  { model: Document },
  { model: Note },
  { model: Department },
];

const basicAttributes = [
  'id', 'firstName', 'lastName', 'email', 'phoneNumber',
  'departmentId', 'position', 'employmentType', 'status',
  'hireDate', 'photoUrl',
];

// ─── 2.1 List Employees ─────────────────────────────────────

exports.list = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const offset = (page - 1) * limit;
    const { search, department, status, sortBy, sortOrder } = req.query;

    // Build where clause
    const where = { companyId: req.user.companyId };
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { id: { [Op.like]: `%${search}%` } },
        { position: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status) where.status = status;

    // Handle department filter (by name)
    if (department) {
      const dept = await Department.findOne({ where: { name: department, companyId: req.user.companyId } });
      if (dept) where.departmentId = dept.id;
      else {
        return res.json({
          success: true,
          data: { employees: [], pagination: { page, limit, totalItems: 0, totalPages: 0 } },
        });
      }
    }

    // Sorting
    const order = [];
    const sortField = sortBy || 'firstName';
    const sortDir = sortOrder === 'desc' ? 'DESC' : 'ASC';
    const allowedSortFields = ['firstName', 'lastName', 'departmentId', 'hireDate', 'status'];
    if (allowedSortFields.includes(sortField)) {
      order.push([sortField, sortDir]);
    } else {
      order.push(['firstName', 'ASC']);
    }

    const { count, rows } = await Employee.findAndCountAll({
      where,
      attributes: basicAttributes,
      include: [{ model: Department, as: 'Department', attributes: ['name'] }],
      order,
      limit,
      offset,
    });

    const employees = rows.map((emp) => {
      const e = emp.toJSON();
      e.department = e.Department?.name || null;
      delete e.Department;
      delete e.departmentId;
      return e;
    });

    res.json({
      success: true,
      data: {
        employees,
        pagination: {
          page,
          limit,
          totalItems: count,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2.2 Get Single Employee ────────────────────────────────

exports.getById = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      where: { id: req.params.id, companyId: req.user.companyId },
      include: fullInclude,
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const result = employee.toJSON();
    // Flatten department name
    if (result.Department) {
      result.department = result.Department.name;
      delete result.Department;
    }
    delete result.departmentId;

    res.json({
      success: true,
      data: { employee: result },
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2.3 Create Employee ────────────────────────────────────

exports.create = async (req, res, next) => {
  try {
    const {
      firstName, lastName, email, phoneNumber, gender,
      department: deptName, position, employmentType, hireDate, status,
    } = req.body;

    // Validate required fields
    if (!firstName || firstName.length < 2) throw new AppError('First name must be at least 2 characters', 400);
    if (!lastName || lastName.length < 2) throw new AppError('Last name must be at least 2 characters', 400);
    if (!email) throw new AppError('Email is required', 400);
    if (!phoneNumber || phoneNumber.length < 6) throw new AppError('Phone number must be at least 6 characters', 400);
    if (!gender) throw new AppError('Gender is required', 400);
    if (!['Male', 'Female', 'Other'].includes(gender)) throw new AppError('Gender must be Male, Female, or Other', 400);
    if (!deptName) throw new AppError('Department is required', 400);
    if (!position || position.length < 2) throw new AppError('Position must be at least 2 characters', 400);
    if (!employmentType) throw new AppError('Employment type is required', 400);
    if (!['Full-time', 'Part-time', 'Contract', 'Intern', 'Remote'].includes(employmentType)) {
      throw new AppError('Invalid employment type', 400);
    }
    if (status && !['Active', 'Inactive', 'Probation', 'OnLeave', 'Resigned', 'Terminated'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    // Check unique email
    const existingEmail = await Employee.findOne({ where: { email } });
    if (existingEmail) throw new AppError('An employee with this email already exists', 400);

    // Check unique phone number
    const existingPhone = await Employee.findOne({ where: { phoneNumber } });
    if (existingPhone) throw new AppError('An employee with this phone number already exists', 400);

    // Resolve department
    const dept = await Department.findOne({ where: { name: deptName, companyId: req.user.companyId } });
    if (!dept) throw new AppError(`Department "${deptName}" not found`, 400);

    const id = await generateEmployeeId();

    const employee = await Employee.create({
      id,
      firstName, lastName, email, phoneNumber, gender,
      departmentId: dept.id, position, employmentType,
      hireDate: hireDate || new Date().toISOString().split('T')[0],
      status: status || 'Active',
      companyId: req.user.companyId,
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        department: deptName,
        position: employee.position,
        status: employee.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2.4 Update Employee ────────────────────────────────────

exports.update = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!employee) throw new AppError('Employee not found', 404);

    const updatableFields = [
      'firstName', 'lastName', 'email', 'phoneNumber', 'gender',
      'dob', 'address', 'emergencyContact', 'position',
      'employmentType', 'hireDate', 'reportingManager', 'status', 'photoUrl',
    ];

    const updates = {};
    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Handle department update
    if (req.body.department) {
      const dept = await Department.findOne({ where: { name: req.body.department, companyId: req.user.companyId } });
      if (!dept) throw new AppError(`Department "${req.body.department}" not found`, 400);
      updates.departmentId = dept.id;
    }

    await employee.update(updates);

    // Re-fetch with department name
    const updated = await Employee.findByPk(req.params.id, {
      include: [{ model: Department, as: 'Department', attributes: ['name'] }],
    });

    const result = updated.toJSON();
    result.department = result.Department?.name || null;
    delete result.Department;
    delete result.departmentId;

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2.5 Delete Employee ────────────────────────────────────

exports.remove = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!employee) throw new AppError('Employee not found', 404);

    await employee.destroy();

    res.json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2.6 Update Salary ──────────────────────────────────────

exports.updateSalary = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!employee) throw new AppError('Employee not found', 404);

    const { baseSalary, bonus, allowances } = req.body;

    const [salary, created] = await Salary.findOrCreate({
      where: { employeeId: employee.id },
      defaults: { baseSalary: baseSalary || 0, bonus: bonus || 0, allowances: allowances || 0, employeeId: employee.id },
    });

    if (!created) {
      await salary.update({ baseSalary, bonus, allowances });
    }

    res.json({
      success: true,
      data: {
        id: employee.id,
        salary: {
          baseSalary: parseFloat(salary.baseSalary),
          bonus: parseFloat(salary.bonus),
          allowances: parseFloat(salary.allowances),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2.7 Update Bank Account ────────────────────────────────

exports.updateBank = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!employee) throw new AppError('Employee not found', 404);

    const { bankName, accountName, accountNumber } = req.body;

    const [bank, created] = await BankAccount.findOrCreate({
      where: { employeeId: employee.id },
      defaults: { bankName, accountName, accountNumber, employeeId: employee.id },
    });

    if (!created) {
      await bank.update({ bankName, accountName, accountNumber });
    }

    res.json({
      success: true,
      data: {
        id: employee.id,
        bankAccount: {
          bankName: bank.bankName,
          accountName: bank.accountName,
          accountNumber: bank.accountNumber,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2.8.1 Add Education Record ─────────────────────────────

exports.addEducation = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!employee) throw new AppError('Employee not found', 404);

    const { institutionName, degree, qualification, fieldOfStudy, graduationYear } = req.body;

    const education = await Education.create({
      institutionName, degree, qualification, fieldOfStudy, graduationYear,
      employeeId: employee.id,
    });

    res.status(201).json({
      success: true,
      data: {
        id: education.id,
        institutionName: education.institutionName,
        degree: education.degree,
        qualification: education.qualification,
        fieldOfStudy: education.fieldOfStudy,
        graduationYear: education.graduationYear,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2.8.2 Delete Education Record ──────────────────────────

exports.deleteEducation = async (req, res, next) => {
  try {
    const education = await Education.findOne({
      where: { id: req.params.educationId, employeeId: req.params.id },
    });
    if (!education) throw new AppError('Education record not found', 404);

    await education.destroy();

    res.json({
      success: true,
      message: 'Education record deleted',
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2.9.1 Add Document ─────────────────────────────────────

exports.addDocument = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!employee) throw new AppError('Employee not found', 404);

    if (!req.file) throw new AppError('File is required', 400);

    const { name, type } = req.body;
    if (!name) throw new AppError('Document name is required', 400);
    if (!type) throw new AppError('Document type is required', 400);

    const fileUrl = `/uploads/${req.body.directory || 'documents'}/${req.file.filename}`;

    const document = await Document.create({
      name,
      type,
      fileUrl,
      employeeId: employee.id,
    });

    res.status(201).json({
      success: true,
      data: {
        id: document.id,
        name: document.name,
        type: document.type,
        uploadDate: document.uploadDate,
        fileUrl: document.fileUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2.9.2 Delete Document ──────────────────────────────────

exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      where: { id: req.params.documentId, employeeId: req.params.id },
    });
    if (!document) throw new AppError('Document not found', 404);

    await document.destroy();

    res.json({
      success: true,
      message: 'Document deleted',
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2.10.1 Add Note ────────────────────────────────────────

exports.addNote = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!employee) throw new AppError('Employee not found', 404);

    const { text } = req.body;
    if (!text) throw new AppError('Note text is required', 400);

    const note = await Note.create({ text, employeeId: employee.id });

    res.status(201).json({
      success: true,
      data: {
        id: note.id,
        text: note.text,
        createdDate: note.createdDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2.10.2 Delete Note ─────────────────────────────────────

exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({
      where: { id: req.params.noteId, employeeId: req.params.id },
    });
    if (!note) throw new AppError('Note not found', 404);

    await note.destroy();

    res.json({
      success: true,
      message: 'Note deleted',
    });
  } catch (error) {
    next(error);
  }
};
