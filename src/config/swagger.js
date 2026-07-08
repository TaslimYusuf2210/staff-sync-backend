const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StaffSync API',
      version: '1.0.0',
      description: 'Employee Management Dashboard — Backend API',
      contact: {
        email: 'admin@rockscompany.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.staffsync.com/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // ─── Error ──────────────────────────────────────────
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description' },
            errors: {
              type: 'object',
              example: { fieldName: ['Validation error message'] },
            },
          },
        },

        // ─── Auth ───────────────────────────────────────────
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@rockscompany.com' },
            password: { type: 'string', minLength: 6, example: 'securePassword123' },
            rememberMe: { type: 'boolean', default: false },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                expiresIn: { type: 'integer', example: 86400 },
                user: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['companyName', 'email', 'description', 'phone', 'address', 'password', 'agreeTerms'],
          properties: {
            companyName: { type: 'string', minLength: 2, example: 'Rocks Company Ltd' },
            email: { type: 'string', format: 'email', example: 'admin@rockscompany.com' },
            description: { type: 'string', example: 'Corporate Headquarters' },
            phone: { type: 'string', example: '08000000000' },
            address: { type: 'string', example: '42 Example Street, Lagos, Nigeria' },
            password: { type: 'string', minLength: 6, example: 'securePassword123' },
            agreeTerms: { type: 'boolean', example: true },
          },
        },
        RegisterResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Account created successfully' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: { $ref: '#/components/schemas/User' },
                company: { $ref: '#/components/schemas/Company' },
              },
            },
          },
        },
        SendOtpRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@rockscompany.com' },
          },
        },
        VerifyOtpRequest: {
          type: 'object',
          required: ['email', 'otp'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@rockscompany.com' },
            otp: { type: 'string', example: '483291' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'usr-1' },
            name: { type: 'string', example: 'Admin Strator' },
            email: { type: 'string', example: 'admin@rockscompany.com' },
            role: { type: 'string', example: 'admin' },
            profilePicture: { type: 'string', nullable: true, example: 'https://cdn.staffsync.com/images/admin.jpg' },
          },
        },

        // ─── Company ────────────────────────────────────────
        Company: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'comp-1' },
            name: { type: 'string', example: 'Rocks Company Ltd' },
            email: { type: 'string', example: 'contact@rockscompany.com' },
            phoneNumber: { type: 'string', example: '+1 312 908 1234' },
            address: { type: 'string', example: '123 Avenue block, Chicago, IL' },
            description: { type: 'string', example: 'Corporate Headquarters' },
          },
        },

        // ─── Employee ───────────────────────────────────────
        Employee: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'emp-101' },
            firstName: { type: 'string', example: 'Brooklyn' },
            lastName: { type: 'string', example: 'Simmons' },
            email: { type: 'string', example: 'brok-simms@mail.com' },
            phoneNumber: { type: 'string', example: '+1 312 908 1234' },
            department: { type: 'string', example: 'Design' },
            position: { type: 'string', example: 'Creative Director' },
            employmentType: { type: 'string', enum: ['Full-time', 'Part-time', 'Contract', 'Intern', 'Remote'] },
            status: { type: 'string', enum: ['Active', 'Inactive', 'Probation', 'Resigned', 'Terminated'] },
            hireDate: { type: 'string', format: 'date', example: '2024-01-10' },
            photoUrl: { type: 'string', nullable: true },
          },
        },
        EmployeeDetail: {
          allOf: [
            { $ref: '#/components/schemas/Employee' },
            {
              type: 'object',
              properties: {
                gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
                dob: { type: 'string', format: 'date', nullable: true },
                address: { type: 'string', nullable: true },
                emergencyContact: { type: 'string', nullable: true },
                reportingManager: { type: 'string', nullable: true },
                education: { type: 'array', items: { $ref: '#/components/schemas/Education' } },
                salary: { $ref: '#/components/schemas/Salary' },
                bankAccount: { $ref: '#/components/schemas/BankAccount' },
                documents: { type: 'array', items: { $ref: '#/components/schemas/Document' } },
                notes: { type: 'array', items: { $ref: '#/components/schemas/Note' } },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          ],
        },
        CreateEmployeeRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'phoneNumber', 'gender', 'department', 'position', 'employmentType', 'hireDate'],
          properties: {
            firstName: { type: 'string', minLength: 2, example: 'John' },
            lastName: { type: 'string', minLength: 2, example: 'Doe' },
            email: { type: 'string', format: 'email' },
            phoneNumber: { type: 'string', minLength: 6 },
            gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
            department: { type: 'string', example: 'Development' },
            position: { type: 'string', minLength: 2 },
            employmentType: { type: 'string', enum: ['Full-time', 'Part-time', 'Contract', 'Intern', 'Remote'] },
            hireDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['Active', 'Inactive', 'Probation', 'Resigned', 'Terminated'] },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalItems: { type: 'integer', example: 34 },
            totalPages: { type: 'integer', example: 4 },
          },
        },

        // ─── Education ──────────────────────────────────────
        Education: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'edu-1' },
            institutionName: { type: 'string', example: 'MIT' },
            degree: { type: 'string', example: 'Master of Computer Science' },
            qualification: { type: 'string', example: 'M.CompSc' },
            fieldOfStudy: { type: 'string', example: 'Artificial Intelligence' },
            graduationYear: { type: 'string', example: '2020' },
          },
        },

        // ─── Salary ─────────────────────────────────────────
        Salary: {
          type: 'object',
          properties: {
            baseSalary: { type: 'number', example: 8500 },
            bonus: { type: 'number', example: 1500 },
            allowances: { type: 'number', example: 500 },
          },
        },

        // ─── Bank Account ───────────────────────────────────
        BankAccount: {
          type: 'object',
          properties: {
            bankName: { type: 'string', example: 'Chase Bank' },
            accountName: { type: 'string', example: 'Brooklyn Simmons' },
            accountNumber: { type: 'string', example: '1234567890' },
          },
        },

        // ─── Document ───────────────────────────────────────
        Document: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'doc-1' },
            name: { type: 'string', example: 'Resume_Brooklyn.pdf' },
            type: { type: 'string', enum: ['Resume', 'Employment Letter', 'Certificates', 'Other Documents'] },
            uploadDate: { type: 'string', format: 'date', example: '2024-01-09' },
            fileUrl: { type: 'string', example: 'https://cdn.staffsync.com/documents/doc-1.pdf' },
          },
        },

        // ─── Note ───────────────────────────────────────────
        Note: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'n-1' },
            text: { type: 'string', example: 'Employee is performing exceptionally well.' },
            createdDate: { type: 'string', format: 'date', example: '2025-07-01' },
          },
        },

        // ─── Department ─────────────────────────────────────
        Department: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'dep-1' },
            name: { type: 'string', example: 'Design' },
            description: { type: 'string', example: 'User interface design and experience planning.' },
            head: { type: 'string', example: 'Brooklyn Simmons' },
            employeeCount: { type: 'integer', example: 12 },
            dateCreated: { type: 'string', format: 'date', example: '2024-01-10' },
          },
        },

        // ─── Dashboard Stats ────────────────────────────────
        DashboardStats: {
          type: 'object',
          properties: {
            totalEmployees: { type: 'integer', example: 34 },
            activeEmployees: { type: 'integer', example: 28 },
            inactiveEmployees: { type: 'integer', example: 6 },
            totalDepartments: { type: 'integer', example: 4 },
            newEmployeesThisMonth: { type: 'integer', example: 3 },
            employeesByDepartment: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  department: { type: 'string' },
                  count: { type: 'integer' },
                  percentage: { type: 'number' },
                },
              },
            },
            statusDistribution: {
              type: 'object',
              properties: {
                active: { type: 'integer' },
                inactive: { type: 'integer' },
                probation: { type: 'integer' },
                resigned: { type: 'integer' },
                terminated: { type: 'integer' },
              },
            },
            recentEmployees: { type: 'array', items: { $ref: '#/components/schemas/Employee' } },
            growthTrend: {
              type: 'object',
              properties: {
                labels: { type: 'array', items: { type: 'string' } },
                data: { type: 'array', items: { type: 'integer' } },
              },
            },
          },
        },
      },
    },
    paths: {
      // ════════════════════════════════════════════════════════
      // AUTH
      // ════════════════════════════════════════════════════════
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login',
          description: 'Authenticate an admin user and return a JWT token.',
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
          responses: {
            200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } } },
            401: { description: 'Invalid email or password', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register',
          description: 'Register a new organisation / admin account.',
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
          responses: {
            201: { description: 'Account created', content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterResponse' } } } },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/auth/send-otp': {
        post: {
          tags: ['Authentication'],
          summary: 'Send OTP',
          description: 'Send a 6-digit OTP to the user\'s email for registration verification.',
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/SendOtpRequest' } } } },
          responses: {
            200: { description: 'OTP sent', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } } },
            400: { description: 'Validation error or email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/auth/verify-otp': {
        post: {
          tags: ['Authentication'],
          summary: 'Verify OTP',
          description: 'Verify the 6-digit OTP sent to the user\'s email.',
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyOtpRequest' } } } },
          responses: {
            200: { description: 'Email verified', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'object', properties: { verificationToken: { type: 'string' } } } } } } } },
            400: { description: 'Invalid or expired OTP', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/auth/forgot-password': {
        post: {
          tags: ['Authentication'],
          summary: 'Forgot Password',
          description: 'Send a password reset link to the user\'s email.',
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string', format: 'email' } }, required: ['email'] } } },
          },
          responses: {
            200: { description: 'Reset link sent', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } } },
          },
        },
      },
      '/auth/change-password': {
        put: {
          tags: ['Authentication'],
          summary: 'Change Password',
          description: 'Update the authenticated user\'s password.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['currentPassword', 'newPassword', 'confirmPassword'],
                  properties: {
                    currentPassword: { type: 'string', example: 'oldPassword123' },
                    newPassword: { type: 'string', minLength: 6, example: 'newSecurePass456' },
                    confirmPassword: { type: 'string', example: 'newSecurePass456' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Password changed' },
            401: { description: 'Current password is incorrect' },
          },
        },
      },

      // ════════════════════════════════════════════════════════
      // EMPLOYEES
      // ════════════════════════════════════════════════════════
      '/employees': {
        get: {
          tags: ['Employees'],
          summary: 'List Employees',
          description: 'Get a paginated, searchable, filterable, sortable list of employees.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Items per page' },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name, ID, or position' },
            { name: 'department', in: 'query', schema: { type: 'string' }, description: 'Filter by department name' },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['Active', 'Inactive', 'Probation', 'Resigned', 'Terminated'] } },
            { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'dept', 'joined'], default: 'name' } },
            { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
          ],
          responses: {
            200: {
              description: 'Paginated employee list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          employees: { type: 'array', items: { $ref: '#/components/schemas/Employee' } },
                          pagination: { $ref: '#/components/schemas/Pagination' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Employees'],
          summary: 'Create Employee',
          description: 'Register a new employee in the system.',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateEmployeeRequest' } } } },
          responses: {
            201: { description: 'Employee created' },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/employees/{id}': {
        get: {
          tags: ['Employees'],
          summary: 'Get Employee',
          description: 'Get full employee profile including all nested data.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'emp-101' }],
          responses: {
            200: { description: 'Employee details', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { employee: { $ref: '#/components/schemas/EmployeeDetail' } } } } } } } },
            404: { description: 'Employee not found' },
          },
        },
        put: {
          tags: ['Employees'],
          summary: 'Update Employee',
          description: 'Update one or more fields of an employee record. Supports partial updates.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { firstName: { type: 'string' }, lastName: { type: 'string' }, email: { type: 'string' }, phoneNumber: { type: 'string' }, department: { type: 'string' }, position: { type: 'string' }, employmentType: { type: 'string' }, status: { type: 'string' } } } } } },
          responses: { 200: { description: 'Employee updated' }, 404: { description: 'Employee not found' } },
        },
        delete: {
          tags: ['Employees'],
          summary: 'Delete Employee',
          description: 'Remove an employee record from the system.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Employee deleted' }, 404: { description: 'Employee not found' } },
        },
      },
      '/employees/{id}/salary': {
        put: {
          tags: ['Employees - Salary & Bank'],
          summary: 'Update Salary',
          description: 'Update an employee\'s compensation details.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Salary' } } } },
          responses: { 200: { description: 'Salary updated' } },
        },
      },
      '/employees/{id}/bank': {
        put: {
          tags: ['Employees - Salary & Bank'],
          summary: 'Update Bank Account',
          description: 'Update an employee\'s bank details for payroll.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/BankAccount' } } } },
          responses: { 200: { description: 'Bank account updated' } },
        },
      },
      '/employees/{id}/education': {
        post: {
          tags: ['Employees - Education'],
          summary: 'Add Education Record',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Education' } } } },
          responses: { 201: { description: 'Education record added' } },
        },
      },
      '/employees/{id}/education/{educationId}': {
        delete: {
          tags: ['Employees - Education'],
          summary: 'Delete Education Record',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'educationId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Education record deleted' } },
        },
      },
      '/employees/{id}/documents': {
        post: {
          tags: ['Employees - Documents'],
          summary: 'Add Document',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: { type: 'string', format: 'binary', description: 'PDF or image, max 10MB' },
                    name: { type: 'string', description: 'Document display name' },
                    type: { type: 'string', enum: ['Resume', 'Employment Letter', 'Certificates', 'Other Documents'] },
                  },
                  required: ['file', 'name', 'type'],
                },
              },
            },
          },
          responses: { 201: { description: 'Document added' } },
        },
      },
      '/employees/{id}/documents/{documentId}': {
        delete: {
          tags: ['Employees - Documents'],
          summary: 'Delete Document',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'documentId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Document deleted' } },
        },
      },
      '/employees/{id}/notes': {
        post: {
          tags: ['Employees - Notes'],
          summary: 'Add Note',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['text'], properties: { text: { type: 'string' } } } } } },
          responses: { 201: { description: 'Note added' } },
        },
      },
      '/employees/{id}/notes/{noteId}': {
        delete: {
          tags: ['Employees - Notes'],
          summary: 'Delete Note',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'noteId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Note deleted' } },
        },
      },

      // ════════════════════════════════════════════════════════
      // DEPARTMENTS
      // ════════════════════════════════════════════════════════
      '/departments': {
        get: {
          tags: ['Departments'],
          summary: 'List Departments',
          description: 'Get all departments with employee counts.',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Department list', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { departments: { type: 'array', items: { $ref: '#/components/schemas/Department' } } } } } } } } } },
        },
        post: {
          tags: ['Departments'],
          summary: 'Create Department',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, description: { type: 'string' }, head: { type: 'string' } } } } } },
          responses: { 201: { description: 'Department created' } },
        },
      },
      '/departments/{id}': {
        get: {
          tags: ['Departments'],
          summary: 'Get Department',
          description: 'Get department details and its members.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Department with members' } },
        },
        put: {
          tags: ['Departments'],
          summary: 'Update Department',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, head: { type: 'string' } } } } } },
          responses: { 200: { description: 'Department updated' } },
        },
        delete: {
          tags: ['Departments'],
          summary: 'Delete Department',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Department deleted' } },
        },
      },

      // ════════════════════════════════════════════════════════
      // DASHBOARD
      // ════════════════════════════════════════════════════════
      '/dashboard/stats': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get Dashboard Statistics',
          description: 'Aggregated counts and metrics for the overview page.',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Dashboard stats', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/DashboardStats' } } } } } } },
        },
      },

      // ════════════════════════════════════════════════════════
      // REPORTS
      // ════════════════════════════════════════════════════════
      '/reports/employee-summary': {
        get: {
          tags: ['Reports'],
          summary: 'Employee Summary Report',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Employee summary data' } },
        },
      },
      '/reports/salary-summary': {
        get: {
          tags: ['Reports'],
          summary: 'Salary Summary Report',
          description: 'Get payroll and compensation data.',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Salary summary data' } },
        },
      },
      '/reports/hiring-trend': {
        get: {
          tags: ['Reports'],
          summary: 'Hiring Trend Report',
          description: 'Get employee growth data over time.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'period', in: 'query', schema: { type: 'string', enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' } },
            { name: 'months', in: 'query', schema: { type: 'integer', default: 12 }, description: 'Number of months to look back' },
          ],
          responses: { 200: { description: 'Hiring trend data' } },
        },
      },
      '/reports/export': {
        get: {
          tags: ['Reports'],
          summary: 'Export Reports',
          description: 'Generate and download a report in CSV format.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'type', in: 'query', required: true, schema: { type: 'string', enum: ['employee-summary', 'salary-summary', 'hiring-trend'] } },
            { name: 'format', in: 'query', schema: { type: 'string', enum: ['csv', 'xlsx', 'pdf'], default: 'csv' } },
          ],
          responses: { 200: { description: 'File download' } },
        },
      },

      // ════════════════════════════════════════════════════════
      // SETTINGS
      // ════════════════════════════════════════════════════════
      '/settings': {
        get: {
          tags: ['Settings'],
          summary: 'Get Settings',
          description: 'Get admin profile and company information.',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Settings data' } },
        },
      },
      '/settings/admin': {
        put: {
          tags: ['Settings'],
          summary: 'Update Admin Profile',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, profilePicture: { type: 'string' } } } } } },
          responses: { 200: { description: 'Admin profile updated' } },
        },
      },
      '/settings/company': {
        put: {
          tags: ['Settings'],
          summary: 'Update Company Information',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, phoneNumber: { type: 'string' }, address: { type: 'string' } } } } } },
          responses: { 200: { description: 'Company info updated' } },
        },
      },

      // ════════════════════════════════════════════════════════
      // UPLOAD
      // ════════════════════════════════════════════════════════
      '/upload': {
        post: {
          tags: ['Upload'],
          summary: 'Upload File',
          description: 'Upload employee documents, profile photos, or any attachment.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: { type: 'string', format: 'binary', description: 'Max 10MB. PDF, DOC, DOCX, PNG, JPG, JPEG, GIF' },
                    directory: { type: 'string', enum: ['documents', 'photos', 'general'], default: 'general' },
                  },
                  required: ['file'],
                },
              },
            },
          },
          responses: { 201: { description: 'File uploaded' } },
        },
      },

      // ════════════════════════════════════════════════════════
      // HEALTH
      // ════════════════════════════════════════════════════════
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health Check',
          description: 'Check if the API is running.',
          responses: {
            200: {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      uptime: { type: 'number' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
