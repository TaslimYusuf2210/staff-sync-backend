const Admin = require('./Admin');
const Company = require('./Company');
const Employee = require('./Employee');
const Department = require('./Department');
const Position = require('./Position');
const Education = require('./Education');
const Salary = require('./Salary');
const BankAccount = require('./BankAccount');
const Document = require('./Document');
const Note = require('./Note');

// ─── Associations ───────────────────────────────────────────

// Admin ↔ Company (one-to-one)
Admin.hasOne(Company, { foreignKey: 'adminId' });
Company.belongsTo(Admin, { foreignKey: 'adminId' });

// Company ↔ Department (one-to-many)
Company.hasMany(Department, { foreignKey: 'companyId', onDelete: 'CASCADE' });
Department.belongsTo(Company, { foreignKey: 'companyId' });

// Company ↔ Employee (one-to-many)
Company.hasMany(Employee, { foreignKey: 'companyId', onDelete: 'CASCADE' });
Employee.belongsTo(Company, { foreignKey: 'companyId' });

// Department ↔ Employee (one-to-many)
Department.hasMany(Employee, { foreignKey: 'departmentId' });
Employee.belongsTo(Department, { foreignKey: 'departmentId' });

// Department ↔ Position (one-to-many, cascade delete)
Department.hasMany(Position, { foreignKey: 'departmentId', onDelete: 'CASCADE' });
Position.belongsTo(Department, { foreignKey: 'departmentId' });

// Position ↔ Employee (one-to-many)
Position.hasMany(Employee, { foreignKey: 'position' });
Employee.belongsTo(Position, { foreignKey: 'position' });

// Employee → sub-resources (one-to-many / one-to-one)
Employee.hasMany(Education, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
Education.belongsTo(Employee, { foreignKey: 'employeeId' });

Employee.hasOne(Salary, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
Salary.belongsTo(Employee, { foreignKey: 'employeeId' });

Employee.hasOne(BankAccount, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
BankAccount.belongsTo(Employee, { foreignKey: 'employeeId' });

Employee.hasMany(Document, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
Document.belongsTo(Employee, { foreignKey: 'employeeId' });

Employee.hasMany(Note, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
Note.belongsTo(Employee, { foreignKey: 'employeeId' });

module.exports = {
  Admin,
  Company,
  Employee,
  Department,
  Position,
  Education,
  Salary,
  BankAccount,
  Document,
  Note,
};
