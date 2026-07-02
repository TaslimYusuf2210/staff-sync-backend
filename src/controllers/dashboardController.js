const { Op, fn, col } = require('sequelize');
const { Employee, Department } = require('../models');

/**
 * GET /dashboard/stats
 * Aggregated counts and metrics for the overview page.
 */
exports.getStats = async (req, res, next) => {
  try {
    const totalEmployees = await Employee.count();
    const activeEmployees = await Employee.count({ where: { status: 'Active' } });
    const inactiveEmployees = await Employee.count({ where: { status: { [Op.ne]: 'Active' } } });
    const totalDepartments = await Department.count();

    // New employees this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newEmployeesThisMonth = await Employee.count({
      where: { hireDate: { [Op.gte]: startOfMonth.toISOString().split('T')[0] } },
    });

    // Employees by department
    const departments = await Department.findAll({
      include: [{ model: Employee, as: 'Employees', attributes: [] }],
      attributes: ['name', [fn('COUNT', col('Employees.id')), 'count']],
      group: ['Department.id'],
      raw: true,
      nest: true,
    });

    const employeesByDepartment = departments.map((d) => ({
      department: d.name,
      count: parseInt(d.count, 10) || 0,
      percentage: totalEmployees > 0 ? parseFloat(((d.count / totalEmployees) * 100).toFixed(1)) : 0,
    }));

    // Status distribution
    const statuses = ['Active', 'Inactive', 'Probation', 'Resigned', 'Terminated'];
    const statusCounts = await Promise.all(
      statuses.map((s) => Employee.count({ where: { status: s } }))
    );
    const statusDistribution = {};
    statuses.forEach((s, i) => {
      statusDistribution[s.toLowerCase()] = statusCounts[i];
    });

    // Recent employees (last 5)
    const recentEmployees = await Employee.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'firstName', 'lastName', 'position', 'hireDate', 'photoUrl'],
      include: [{ model: Department, as: 'Department', attributes: ['name'] }],
    });

    const recent = recentEmployees.map((e) => {
      const r = e.toJSON();
      r.department = r.Department?.name || null;
      delete r.Department;
      return r;
    });

    // Growth trend (quarterly for now)
    const growthTrend = {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      data: [0, 0, 0, totalEmployees],
    };

    res.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        totalDepartments,
        newEmployeesThisMonth,
        employeesByDepartment,
        statusDistribution,
        recentEmployees: recent,
        growthTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};
