const { Op, fn, col } = require('sequelize');
const { Employee, Department, Salary } = require('../models');

/**
 * GET /reports/employee-summary
 */
exports.employeeSummary = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const totalEmployees = await Employee.count({ where: { companyId } });
    const activeEmployees = await Employee.count({ where: { status: 'Active', companyId } });
    const inactiveEmployees = await Employee.count({ where: { status: { [Op.ne]: 'Active' }, companyId } });
    const totalDepartments = await Department.count({ where: { companyId } });

    const departments = await Department.findAll({
      where: { companyId },
      include: [{ model: Employee, as: 'Employees', attributes: [] }],
      attributes: ['name', [fn('COUNT', col('Employees.id')), 'count']],
      group: ['Department.id'],
      raw: true,
      nest: true,
    });

    const employeesPerDepartment = departments.map((d) => ({
      department: d.name,
      count: parseInt(d.count, 10) || 0,
      percentage: totalEmployees > 0 ? parseFloat(((d.count / totalEmployees) * 100).toFixed(1)) : 0,
    }));

    res.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        totalDepartments,
        employeesPerDepartment,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /reports/salary-summary
 */
exports.salarySummary = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    // Get all departments for this company (including those with 0 employees)
    const departments = await Department.findAll({
      where: { companyId },
      attributes: ['id', 'name'],
    });

    // Get all salaries for this company, with employee and department info
    const salaries = await Salary.findAll({
      include: [{
        model: Employee,
        as: 'Employee',
        where: { companyId },
        include: [{ model: Department, as: 'Department', attributes: ['name'] }],
      }],
    });

    // Build a map: department name → salary stats
    const deptMap = {};
    let totalMonthlyPayroll = 0;

    for (const s of salaries) {
      const base = parseFloat(s.baseSalary) || 0;
      const bonus = parseFloat(s.bonus) || 0;
      const allowances = parseFloat(s.allowances) || 0;
      const total = base + bonus + allowances;
      totalMonthlyPayroll += total;

      const deptName = s.Employee?.Department?.name || 'Others';
      if (!deptMap[deptName]) {
        deptMap[deptName] = { totalPayroll: 0, count: 0 };
      }
      deptMap[deptName].totalPayroll += total;
      deptMap[deptName].count += 1;
    }

    // Build the distribution — start with all known departments, then add Others
    const salaryDistributionByDepartment = [];

    for (const dept of departments) {
      const existing = deptMap[dept.name];
      salaryDistributionByDepartment.push({
        department: dept.name,
        averageSalary: existing ? parseFloat((existing.totalPayroll / existing.count).toFixed(2)) : 0,
        totalPayroll: existing ? parseFloat(existing.totalPayroll.toFixed(2)) : 0,
        employeeCount: existing ? existing.count : 0,
      });
    }

    // Add "Others" group (employees without a department) if any exist
    if (deptMap['Others']) {
      salaryDistributionByDepartment.push({
        department: 'Others',
        averageSalary: parseFloat((deptMap['Others'].totalPayroll / deptMap['Others'].count).toFixed(2)),
        totalPayroll: parseFloat(deptMap['Others'].totalPayroll.toFixed(2)),
        employeeCount: deptMap['Others'].count,
      });
    }

    const employeeCount = salaries.length;
    const avgCompensation = employeeCount > 0
      ? parseFloat((totalMonthlyPayroll / employeeCount).toFixed(2))
      : 0;

    const allValues = salaries.map((s) => {
      const base = parseFloat(s.baseSalary) || 0;
      const bonus = parseFloat(s.bonus) || 0;
      const allowances = parseFloat(s.allowances) || 0;
      return base + bonus + allowances;
    });
    const highestPaid = allValues.length > 0 ? Math.max(...allValues) : 0;

    res.json({
      success: true,
      data: {
        totalMonthlyPayroll: parseFloat(totalMonthlyPayroll.toFixed(2)),
        averageCompensation: avgCompensation,
        highestPaid,
        salaryDistributionByDepartment,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /reports/hiring-trend
 */
exports.hiringTrend = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months, 10) || 12;

    const labels = [];
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthLabel = date.toLocaleString('default', { month: 'short' });
      labels.push(monthLabel);

      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const count = await Employee.count({
        where: {
          hireDate: {
            [Op.between]: [
              startOfMonth.toISOString().split('T')[0],
              endOfMonth.toISOString().split('T')[0],
            ],
          },
        },
      });
      data.push(count);
    }

    res.json({
      success: true,
      data: { labels, data },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /reports/export
 * Returns CSV-format report (placeholder — real export would stream a file).
 */
exports.exportReport = async (req, res, next) => {
  try {
    const { type, format } = req.query;

    if (!type) throw new (require('../utils/AppError'))('Report type is required', 400);

    const formatType = format || 'csv';

    let csvData = '';

    if (type === 'employee-summary') {
      const employees = await Employee.findAll({
        include: [{ model: Department, as: 'Department', attributes: ['name'] }],
      });
      csvData = 'ID,First Name,Last Name,Email,Department,Position,Status,Hire Date\n';
      employees.forEach((e) => {
        csvData += `${e.id},${e.firstName},${e.lastName},${e.email},${e.Department?.name || ''},${e.position},${e.status},${e.hireDate}\n`;
      });
    } else if (type === 'salary-summary') {
      const salaries = await Salary.findAll({
        include: [{ model: Employee, as: 'Employee' }],
      });
      csvData = 'Employee ID,Name,Base Salary,Bonus,Allowances,Total\n';
      salaries.forEach((s) => {
        const total = (parseFloat(s.baseSalary) || 0) + (parseFloat(s.bonus) || 0) + (parseFloat(s.allowances) || 0);
        csvData += `${s.employeeId},${s.Employee?.firstName} ${s.Employee?.lastName},${s.baseSalary},${s.bonus},${s.allowances},${total}\n`;
      });
    } else if (type === 'hiring-trend') {
      csvData = 'Period,Hires\n';
      const months = 12;
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
        const count = await Employee.count({ where: { hireDate: { [Op.between]: [start, end] } } });
        csvData += `${label},${count}\n`;
      }
    } else {
      throw new (require('../utils/AppError'))('Invalid report type', 400);
    }

    const filename = `${type}-${Date.now()}.${formatType}`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  } catch (error) {
    next(error);
  }
};
