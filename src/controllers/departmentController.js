const { Department, Employee } = require('../models');
const AppError = require('../utils/AppError');

// ─── 3.1 List Departments ───────────────────────────────────

exports.list = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      include: [{ model: Employee, as: 'Employees', attributes: [] }],
      attributes: {
        include: [
          [require('sequelize').fn('COUNT', require('sequelize').col('Employees.id')), 'employeeCount'],
        ],
      },
      group: ['Department.id'],
      raw: true,
      nest: true,
    });

    // If no departments, return empty
    const result = departments.length > 0 ? departments : await Department.findAll();

    res.json({
      success: true,
      data: {
        departments: result.map((d) => ({
          id: d.id,
          name: d.name,
          description: d.description,
          head: d.head,
          employeeCount: d.employeeCount || 0,
          dateCreated: d.dateCreated,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── 3.2 Get Single Department ──────────────────────────────

exports.getById = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) throw new AppError('Department not found', 404);

    const members = await Employee.findAll({
      where: { departmentId: department.id },
      attributes: ['id', 'firstName', 'lastName', 'email', 'position', 'status', 'hireDate', 'photoUrl'],
    });

    res.json({
      success: true,
      data: {
        department,
        members,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── 3.3 Create Department ──────────────────────────────────

exports.create = async (req, res, next) => {
  try {
    const { name, description, head } = req.body;

    if (!name) throw new AppError('Department name is required', 400);

    const existing = await Department.findOne({ where: { name } });
    if (existing) throw new AppError('Department with this name already exists', 400);

    const department = await Department.create({
      name,
      description: description || null,
      head: head || 'Not assigned',
    });

    res.status(201).json({
      success: true,
      data: {
        id: department.id,
        name: department.name,
        description: department.description,
        head: department.head,
        dateCreated: department.dateCreated,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── 3.4 Update Department ──────────────────────────────────

exports.update = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) throw new AppError('Department not found', 404);

    const updatableFields = ['name', 'description', 'head'];
    const updates = {};
    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.name) {
      const existing = await Department.findOne({ where: { name: updates.name } });
      if (existing && existing.id !== department.id) {
        throw new AppError('Department with this name already exists', 400);
      }
    }

    await department.update(updates);

    res.json({
      success: true,
      message: 'Department updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── 3.5 Delete Department ──────────────────────────────────

exports.remove = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) throw new AppError('Department not found', 404);

    // Check if employees are assigned
    const employeeCount = await Employee.count({ where: { departmentId: department.id } });
    if (employeeCount > 0) {
      throw new AppError('Cannot delete department with assigned employees. Reassign them first.', 400);
    }

    await department.destroy();

    res.json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
