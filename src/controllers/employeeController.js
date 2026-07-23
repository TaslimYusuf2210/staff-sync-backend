const { Op } = require('sequelize');
const { Employee, Department, Position, Education, Salary, BankAccount, Document, Note } = require('../models');
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
  { model: Position, attributes: ['id', 'title'] },
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
      // Find position IDs matching the search term for position title search
      const matchingPositions = await Position.findAll({
        where: { title: { [Op.like]: `%${search}%` } },
        attributes: ['id'],
      });
      const positionIds = matchingPositions.map((p) => p.id);

      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { id: { [Op.like]: `%${search}%` } },
      ];

      if (positionIds.length > 0) {
        where[Op.or].push({ position: { [Op.in]: positionIds } });
      }
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
      include: [
        { model: Department, as: 'Department', attributes: ['name'] },
        { model: Position, as: 'Position', attributes: ['id', 'title'] },
      ],
      order,
      limit,
      offset,
    });

    const employees = rows.map((emp) => {
      const e = emp.toJSON();
      e.department = e.Department?.name || null;
      e.position = e.Position?.title || e.position || null;
      delete e.Department;
      delete e.Position;
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
    // Flatten position title
    if (result.Position) {
      result.position = result.Position.title;
      result.positionId = result.Position.id;
      delete result.Position;
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

    // Resolve department (optional)
    let resolvedDepartmentId = null;
    let resolvedPositionId = null;

    if (deptName) {
      const dept = await Department.findOne({ where: { name: deptName, companyId: req.user.companyId } });
      if (!dept) throw new AppError(`Department "${deptName}" not found`, 400);
      resolvedDepartmentId = dept.id;

      // Validate position exists in the selected department (optional)
      if (position) {
        const pos = await Position.findOne({
          where: { title: position, departmentId: dept.id },
        });
        if (!pos) {
          throw new AppError('Selected position does not exist in this department', 400);
        }
        resolvedPositionId = pos.id;
      }
    }

    const id = await generateEmployeeId();

    const employee = await Employee.create({
      id,
      firstName, lastName, email, phoneNumber, gender,
      departmentId: resolvedDepartmentId, position: resolvedPositionId, employmentType,
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
        position: position || null,
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
      'dob', 'address', 'emergencyContact',
      'employmentType', 'hireDate', 'reportingManager', 'status', 'photoUrl',
    ];

    const updates = {};
    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Handle department update — if department changes, reset position
    if (req.body.department !== undefined) {
      if (req.body.department) {
        const dept = await Department.findOne({ where: { name: req.body.department, companyId: req.user.companyId } });
        if (!dept) throw new AppError(`Department "${req.body.department}" not found`, 400);

        const departmentChanged = dept.id !== employee.departmentId;
        updates.departmentId = dept.id;

        if (departmentChanged) {
          // Position must be re-specified when department changes
          if (!req.body.position) {
            throw new AppError(
              'Department changed — position must be re-specified for the new department',
              400
            );
          }
          // Validate new position belongs to the new department
          const newPos = await Position.findOne({
            where: { title: req.body.position, departmentId: dept.id },
          });
          if (!newPos) {
            throw new AppError('Selected position does not exist in the new department', 400);
          }
          updates.position = newPos.id;
        }
      } else {
        // department explicitly set to empty/null — clear it
        updates.departmentId = null;
        updates.position = null;
      }
    } else if (req.body.position !== undefined) {
      if (req.body.position) {
        // Position update without department change — validate position belongs to current department
        const currentDeptId = employee.departmentId;
        if (!currentDeptId) {
          throw new AppError('Cannot set position — employee has no department assigned', 400);
        }
        const pos = await Position.findOne({
          where: { title: req.body.position, departmentId: currentDeptId },
        });
        if (!pos) {
          throw new AppError('Selected position does not exist in this department', 400);
        }
        updates.position = pos.id;
      } else {
        // position explicitly set to empty/null — clear it
        updates.position = null;
      }
    }

    await employee.update(updates);

    // Re-fetch with department name and position title
    const updated = await Employee.findByPk(req.params.id, {
      include: [
        { model: Department, as: 'Department', attributes: ['name'] },
        { model: Position, as: 'Position', attributes: ['id', 'title'] },
      ],
    });

    const result = updated.toJSON();
    result.department = result.Department?.name || null;
    result.position = result.Position?.title || null;
    delete result.Department;
    delete result.Position;
    delete result.departmentId;

    res.json({
      success: true,
      data: { employee: result },
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

    const { institutionName, qualification, fieldOfStudy, graduationYear } = req.body;

    const education = await Education.create({
      institutionName, qualification, fieldOfStudy, graduationYear,
      employeeId: employee.id,
    });

    res.status(201).json({
      success: true,
      data: {
        education: {
          id: education.id,
          institutionName: education.institutionName,
          qualification: education.qualification,
          fieldOfStudy: education.fieldOfStudy,
          graduationYear: education.graduationYear,
        },
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
      message: 'Education record deleted successfully',
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

    const { name, type, fileUrl } = req.body;
    if (!name) throw new AppError('Document name is required', 400);
    if (!type) throw new AppError('Document type is required', 400);
    if (!fileUrl) throw new AppError('fileUrl is required — upload the file to a cloud service and provide the URL', 400);

    const document = await Document.create({
      name,
      type,
      fileUrl,
      employeeId: employee.id,
    });

    res.status(201).json({
      success: true,
      data: {
        document: {
          id: document.id,
          name: document.name,
          type: document.type,
          uploadDate: document.uploadDate,
          fileUrl: document.fileUrl,
        },
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
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2.9.3 Download Document (proxy from Cloudinary) ────────

exports.downloadDocument = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!employee) throw new AppError('Employee not found', 404);

    const document = await Document.findOne({
      where: { id: req.params.documentId, employeeId: req.params.id },
    });
    if (!document) throw new AppError('Document not found', 404);
    if (!document.fileUrl) throw new AppError('Document has no file URL', 404);

    const response = await fetch(document.fileUrl);
    if (!response.ok) {
      throw new AppError('Failed to fetch file from storage', 500);
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    // Pipe the Cloudinary response to the client
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    next(error);
  }
};

// ─── 2.10.1 Add Note ────────────────────────────────────────

exports.addNote = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
    if (!employee) throw new AppError('Employee not found', 404);

    const { title, text } = req.body;
    if (!title) throw new AppError('Note title is required', 400);
    if (!text) throw new AppError('Note text is required', 400);

    const note = await Note.create({ title, text, employeeId: employee.id });

    res.status(201).json({
      success: true,
      data: {
        note: {
          id: note.id,
          title: note.title,
          text: note.text,
          createdDate: note.createdDate,
        },
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
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
