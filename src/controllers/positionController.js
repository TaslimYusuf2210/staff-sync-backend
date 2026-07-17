const { Op } = require('sequelize');
const { Position, Department, Employee } = require('../models');
const AppError = require('../utils/AppError');

const { v4: uuidv4 } = require('uuid');

// ─── Helper: verify department belongs to user's company ────

const verifyDepartmentAccess = async (departmentId, companyId) => {
  const department = await Department.findOne({
    where: { id: departmentId, companyId },
  });
  if (!department) throw new AppError('Department not found', 404);
  return department;
};

// ─── GET /departments/:departmentId/positions ───────────────

exports.list = async (req, res, next) => {
  try {
    await verifyDepartmentAccess(req.params.departmentId, req.user.companyId);

    const positions = await Position.findAll({
      where: { departmentId: req.params.departmentId },
      attributes: ['id', 'title', 'description', 'createdAt', 'updatedAt'],
      order: [['title', 'ASC']],
    });

    res.json({
      success: true,
      data: { positions },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /departments/:departmentId/positions ──────────────
// Accepts an array of positions — single or bulk in one endpoint.
// Body: [{ "title": "...", "description": "..." }, ...]

exports.create = async (req, res, next) => {
  try {
    await verifyDepartmentAccess(req.params.departmentId, req.user.companyId);

    const positions = req.body;

    if (!Array.isArray(positions) || positions.length === 0) {
      throw new AppError('Request body must be a non-empty array of positions', 400);
    }

    const created = [];
    const errors = [];

    for (let i = 0; i < positions.length; i++) {
      const { title, description } = positions[i];

      if (!title || title.trim().length < 2) {
        errors.push({ index: i, title: title || '', error: 'Title must be at least 2 characters' });
        continue;
      }

      // Case-insensitive uniqueness check (against existing + already created in this batch)
      const trimmedTitle = title.trim();
      const duplicateInDb = await Position.findOne({
        where: {
          departmentId: req.params.departmentId,
          title: { [Op.like]: trimmedTitle },
        },
      });
      const duplicateInBatch = created.find(
        (p) => p.title.toLowerCase() === trimmedTitle.toLowerCase()
      );

      if (duplicateInDb || duplicateInBatch) {
        errors.push({ index: i, title: trimmedTitle, error: `Position "${trimmedTitle}" already exists in this department` });
        continue;
      }

      const position = await Position.create({
        id: uuidv4(),
        departmentId: req.params.departmentId,
        title: trimmedTitle,
        description: description || null,
      });

      created.push({
        id: position.id,
        title: position.title,
        description: position.description,
        departmentId: position.departmentId,
        createdAt: position.createdAt,
        updatedAt: position.updatedAt,
      });
    }

    const statusCode = created.length > 0 ? 201 : 400;

    res.status(statusCode).json({
      success: created.length > 0,
      message: created.length > 0
        ? `Successfully created ${created.length} position(s)`
        : 'No positions were created',
      data: {
        created,
        errors: errors.length > 0 ? errors : undefined,
        totalCreated: created.length,
        totalErrors: errors.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /departments/:departmentId/positions/:positionId ───

exports.update = async (req, res, next) => {
  try {
    await verifyDepartmentAccess(req.params.departmentId, req.user.companyId);

    const position = await Position.findOne({
      where: { id: req.params.positionId, departmentId: req.params.departmentId },
    });
    if (!position) throw new AppError('Position not found', 404);

    const { title, description } = req.body;

    const updates = {};
    if (title !== undefined) {
      if (title.trim().length < 2) {
        throw new AppError('Position title must be at least 2 characters', 400);
      }

      // Check case-insensitive uniqueness (excluding current position)
      const duplicate = await Position.findOne({
        where: {
          departmentId: req.params.departmentId,
          title: { [Op.like]: title.trim() },
          id: { [Op.ne]: req.params.positionId },
        },
      });
      if (duplicate) {
        throw new AppError(
          `Position "${title.trim()}" already exists in this department`,
          400
        );
      }
      updates.title = title.trim();
    }
    if (description !== undefined) {
      updates.description = description;
    }

    await position.update(updates);

    res.json({
      success: true,
      message: 'Position updated successfully',
      data: {
        id: position.id,
        title: position.title,
        description: position.description,
        departmentId: position.departmentId,
        createdAt: position.createdAt,
        updatedAt: position.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /departments/:departmentId/positions/:positionId ─

exports.remove = async (req, res, next) => {
  try {
    await verifyDepartmentAccess(req.params.departmentId, req.user.companyId);

    const position = await Position.findOne({
      where: { id: req.params.positionId, departmentId: req.params.departmentId },
    });
    if (!position) throw new AppError('Position not found', 404);

    // Check if employees are assigned to this position
    const employeeCount = await Employee.count({
      where: { position: position.id, departmentId: req.params.departmentId },
    });
    if (employeeCount > 0) {
      throw new AppError(
        `Cannot delete — ${employeeCount} employee(s) are assigned to this position. Reassign them first.`,
        400
      );
    }

    await position.destroy();

    res.json({
      success: true,
      message: 'Position deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /departments/:departmentId/positions/stats ─────────

exports.stats = async (req, res, next) => {
  try {
    await verifyDepartmentAccess(req.params.departmentId, req.user.companyId);

    const positions = await Position.findAll({
      where: { departmentId: req.params.departmentId },
      attributes: ['id', 'title'],
      raw: true,
    });

    // Count employees per position
    const stats = await Promise.all(
      positions.map(async (pos) => {
        const count = await Employee.count({
          where: { position: pos.id, departmentId: req.params.departmentId },
        });
        return {
          positionId: pos.id,
          title: pos.title,
          employeeCount: count,
        };
      })
    );

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};
