/**
 * Seed script — populates the database with initial data.
 * Run: node seed.js
 */
const bcrypt = require('bcryptjs');
const { sequelize, testConnection } = require('./src/config/database');
require('./src/models');
const { Admin, Company, Department, Employee, Salary, BankAccount, Education, Note } = require('./src/models');
const { generateDepartmentId, deriveAbbreviation, generateEmployeeId } = require('./src/utils/generateId');

const seed = async () => {
  const connected = await testConnection();
  if (!connected) {
    console.error('Cannot seed: database not connected.');
    process.exit(1);
  }

  await sequelize.sync({ force: true });
  console.log('✅ Tables recreated');

  // ── Admin ──────────────────────────────────────────────────
  const admin = await Admin.create({
    name: 'Admin Strator',
    email: 'admin@rockscompany.com',
    password: await bcrypt.hash('securePassword123', 12),
    role: 'admin',
    profilePicture: 'https://cdn.staffsync.com/images/admin.jpg',
  });

  // ── Company ────────────────────────────────────────────────
  await Company.create({
    name: 'Rocks Company Ltd',
    email: 'contact@rockscompany.com',
    phoneNumber: '+1 312 908 1234',
    address: '123 Avenue block, Chicago, IL',
    description: 'Corporate Headquarters',
    adminId: admin.id,
  });

  // ── Departments ────────────────────────────────────────────
  const design = await Department.create({
    id: await generateDepartmentId('Design'),
    name: 'Design',
    abbreviation: deriveAbbreviation('Design'),
    description: 'User interface design, experience planning, and product aesthetics research.',
    head: 'Brooklyn Simmons',
  });

  const dev = await Department.create({
    id: await generateDepartmentId('Development'),
    name: 'Development',
    abbreviation: deriveAbbreviation('Development'),
    description: 'Engineering, stack architecture, DevOps.',
    head: 'Cody Fisher',
  });

  const hr = await Department.create({
    id: await generateDepartmentId('HR'),
    name: 'HR',
    abbreviation: deriveAbbreviation('HR'),
    description: 'Human resources, recruitment, and employee relations.',
    head: 'Not assigned',
  });

  const marketing = await Department.create({
    id: await generateDepartmentId('Marketing'),
    name: 'Marketing',
    abbreviation: deriveAbbreviation('Marketing'),
    description: 'Brand strategy, campaigns, and market research.',
    head: 'Not assigned',
  });

  // ── Employees ──────────────────────────────────────────────
  const emp1 = await Employee.create({
    id: await generateEmployeeId(),
    firstName: 'Brooklyn',
    lastName: 'Simmons',
    email: 'brok-simms@mail.com',
    phoneNumber: '+1 312 908 1234',
    gender: 'Female',
    dob: '1992-05-14',
    address: '123 Avenue block, Chicago, IL',
    emergencyContact: 'Mark Simmons (+1 312 908 4321)',
    departmentId: design.id,
    position: 'Creative Director',
    employmentType: 'Full-time',
    hireDate: '2024-01-10',
    reportingManager: 'Self',
    status: 'Active',
    photoUrl: 'https://cdn.staffsync.com/photos/emp-101.jpg',
  });

  const emp2 = await Employee.create({
    id: await generateEmployeeId(),
    firstName: 'Cody',
    lastName: 'Fisher',
    email: 'cody.fisher@mail.com',
    phoneNumber: '+1 312 908 5678',
    gender: 'Male',
    departmentId: dev.id,
    position: 'Lead Developer',
    employmentType: 'Full-time',
    hireDate: '2024-01-12',
    status: 'Active',
  });

  const emp3 = await Employee.create({
    id: await generateEmployeeId(),
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phoneNumber: '+1 555 123 4567',
    gender: 'Male',
    departmentId: dev.id,
    position: 'Software Engineer',
    employmentType: 'Full-time',
    hireDate: '2025-07-01',
    status: 'Active',
  });

  // ── Salary ─────────────────────────────────────────────────
  await Salary.create({ baseSalary: 8500, bonus: 1500, allowances: 500, employeeId: emp1.id });
  await Salary.create({ baseSalary: 7200, bonus: 1000, allowances: 300, employeeId: emp2.id });

  // ── Bank Account ───────────────────────────────────────────
  await BankAccount.create({
    bankName: 'Chase Bank',
    accountName: 'Brooklyn Simmons',
    accountNumber: '1234567890',
    employeeId: emp1.id,
  });

  // ── Education ──────────────────────────────────────────────
  await Education.create({
    institutionName: 'Chicago Art Institute',
    degree: 'Bachelor of Fine Arts',
    qualification: 'BFA',
    fieldOfStudy: 'Graphic Design',
    graduationYear: '2014',
    employeeId: emp1.id,
  });

  // ── Notes ──────────────────────────────────────────────────
  await Note.create({
    text: 'Brooklyn has outstanding creative inputs.',
    employeeId: emp1.id,
  });

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('   Email:    admin@rockscompany.com');
  console.log('   Password: securePassword123');
  console.log('\n📊 Seeded data: 4 departments, 3 employees, plus salaries, bank, education, notes.\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
