# StaffSync — Backend API Specification

> **Project:** StaffSync Employee Management Dashboard  
> **Base URL:** `https://api.staffsync.com/v1`  
> **Auth:** All endpoints except `/auth/*` require a `Bearer <token>` header.  
> **Content-Type:** `application/json` (unless file upload)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Employees](#2-employees)
3. [Departments](#3-departments)
4. [Dashboard](#4-dashboard)
5. [Reports](#5-reports)
6. [Settings](#6-settings)
7. [File Uploads](#7-file-uploads)
8. [Data Models](#8-data-models)

---

## 1. Authentication

---

### 1.1 Login

Authenticate an admin user and return a JWT token.

**`POST /auth/login`**

**Request Body:**

```json
{
  "email": "admin@rockscompany.com",
  "password": "securePassword123",
  "rememberMe": true
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400,
    "user": {
      "id": "usr-1",
      "name": "Admin Strator",
      "email": "admin@rockscompany.com",
      "role": "admin",
      "profilePicture": "https://cdn.staffsync.com/images/admin.jpg"
    }
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Validation:**
| Field | Type | Rules |
|-------------|---------|------------------------------|
| email | string | Required, valid email format |
| password | string | Required, min 6 characters |
| rememberMe | boolean | Optional, defaults to false |

---

### 1.2 Register / Create Account

Register a new organisation / admin account.

**`POST /auth/register`**

**Request Body:**

```json
{
  "companyName": "Rocks Company Ltd",
  "email": "admin@rockscompany.com",
  "description": "Corporate Headquarters",
  "phone": "+2348129887896",
  "address": {
    "state": "FCT",
    "lga": "Municipal",
    "settlement": "Wuse 2",
    "street": "42 Michael Okpara Street, House 7"
  },
  "password": "securePassword123",
  "agreeTerms": true
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "usr-1",
      "name": "Admin",
      "email": "admin@rockscompany.com",
      "role": "admin"
    },
    "company": {
      "id": "comp-1",
      "name": "Rocks Company Ltd",
      "description": "Corporate Headquarters",
      "phoneNumber": "+2348129887896",
      "address": {
        "state": "FCT",
        "lga": "Municipal",
        "settlement": "Wuse 2",
        "street": "42 Michael Okpara Street, House 7"
      }
    }
  }
}
```

**Validation:**
| Field | Type | Rules |
|----------------|---------|--------------------------------------------------------|
| companyName | string | Required, min 2 characters |
| email | string | Required, valid email format, must be unique |
| description | string | Required, one of predefined company types |
| phone | string | Required, must be a valid Nigerian number starting with +234 |
| address | object | Required, must include `state`, `lga`, `settlement`, and `street` |
| password | string | Required, min 6 characters |
| agreeTerms | boolean | Required, must be `true` |

---

### 1.5 Get Current User

Return the currently authenticated user's company details.

**`GET /auth/me`**

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "company": {
      "id": "comp-1",
      "name": "Rocks Company Ltd",
      "description": "Corporate Headquarters",
      "email": "admin@rockscompany.com",
      "phoneNumber": "+2348129887896",
      "address": {
        "state": "FCT",
        "lga": "Municipal",
        "settlement": "Wuse 2",
        "street": "42 Michael Okpara Street, House 7"
      }
    }
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Authentication required"
}
```

---

### 1.6 Send OTP

Send a 6-digit OTP to the user's email for registration verification.

**`POST /auth/send-otp`**

**Request Body:**

```json
{
  "email": "admin@rockscompany.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "OTP sent to email"
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "An account with this email already exists"
}
```

**Validation:**
| Field | Type | Rules |
|-------|------|-------|
| email | string | Required, valid email format, must not already be registered |

---

### 1.7 Verify OTP

Verify the 6-digit OTP sent to the user's email.

**`POST /auth/verify-otp`**

**Request Body:**

```json
{
  "email": "admin@rockscompany.com",
  "otp": "483291"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Email verified",
  "data": {
    "verificationToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

**Validation:**
| Field | Type | Rules |
|-------|------|-------|
| email | string | Required, must match the email used to request the OTP |
| otp | string | Required, 6-digit numeric code |

---

### 1.3 Forgot Password

Send a password reset link to the user's email.

**`POST /auth/forgot-password`**

**Request Body:**

```json
{
  "email": "admin@rockscompany.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

---

### 1.4 Change Password

Update the authenticated user's password.

**`PUT /auth/change-password`**

**Request Body:**

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePass456"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 2. Employees

---

### 2.1 List Employees

Get a paginated, searchable, filterable, sortable list of employees.

**`GET /employees`**

**Query Parameters:**
| Parameter | Type | Default | Description |
|-------------|---------|----------|------------------------------------------------------|
| page | integer | 1 | Page number for pagination |
| limit | integer | 10 | Items per page |
| search | string | — | Search by name, ID, or position (partial match) |
| department | string | — | Filter by department name (exact match) |
| status | string | — | Filter by status: `Active`, `Inactive`, `Probation`, `Resigned`, `Terminated` |
| sortBy | string | `name` | Sort field: `name`, `dept`, `joined` |
| sortOrder | string | `asc` | Sort direction: `asc` or `desc` |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": "EMP-26-07-001",
        "firstName": "Brooklyn",
        "lastName": "Simmons",
        "email": "brok-simms@mail.com",
        "phoneNumber": "+1 312 908 1234",
        "department": "Design",
        "position": "Creative Director",
        "employmentType": "Full-time",
        "status": "Active",
        "hireDate": "2024-01-10",
        "photoUrl": "https://cdn.staffsync.com/photos/EMP-26-07-001.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 34,
      "totalPages": 4
    }
  }
}
```

---

### 2.2 Get Single Employee

Get full employee profile including all nested data.

**`GET /employees/:id`**

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "employee": {
      "id": "EMP-26-07-001",
      "firstName": "Brooklyn",
      "lastName": "Simmons",
      "email": "brok-simms@mail.com",
      "phoneNumber": "+1 312 908 1234",
      "gender": "Female",
      "dob": "1992-05-14",
      "address": "123 Avenue block, Chicago, IL",
      "emergencyContact": "Mark Simmons (+1 312 908 4321)",
      "department": "Design",
      "position": "Creative Director",
      "employmentType": "Full-time",
      "hireDate": "2024-01-10",
      "reportingManager": "Self",
      "status": "Active",
      "photoUrl": "https://cdn.staffsync.com/photos/EMP-26-07-001.jpg",
      "education": [
        {
          "id": "edu-1",
          "institutionName": "Chicago Art Institute",
          "degree": "Bachelor of Fine Arts",
          "qualification": "BFA",
          "fieldOfStudy": "Graphic Design",
          "graduationYear": "2014"
        }
      ],
      "salary": {
        "baseSalary": 8500,
        "bonus": 1500,
        "allowances": 500
      },
      "bankAccount": {
        "bankName": "Chase Bank",
        "accountName": "Brooklyn Simmons",
        "accountNumber": "1234567890"
      },
      "documents": [
        {
          "id": "doc-1",
          "name": "Resume_Brooklyn.pdf",
          "type": "Resume",
          "uploadDate": "2024-01-09",
          "fileUrl": "https://cdn.staffsync.com/documents/doc-1.pdf"
        }
      ],
      "notes": [
        {
          "id": "n-1",
          "text": "Brooklyn has outstanding creative inputs.",
          "createdDate": "2024-02-10"
        }
      ],
      "createdAt": "2024-01-10T08:00:00Z",
      "updatedAt": "2024-06-15T14:30:00Z"
    }
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Employee not found"
}
```

---

### 2.3 Create Employee

Register a new employee in the system.

**`POST /employees`**

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phoneNumber": "+1 555 123 4567",
  "gender": "Male",
  "department": "Development",
  "position": "Software Engineer",
  "employmentType": "Full-time",
  "hireDate": "2025-07-01",
  "status": "Active"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "id": "EMP-26-07-002",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "department": "Development",
    "position": "Software Engineer",
    "status": "Active"
  }
}
```

**Validation:**
| Field | Type | Rules |
|----------------|--------|-------------------------------------------------------------|
| firstName | string | Required, min 2 characters |
| lastName | string | Required, min 2 characters |
| email | string | Required, valid email format |
| phoneNumber | string | Required, min 6 characters |
| gender | string | Required, one of: `Male`, `Female`, `Other` |
| department | string | Required, must match an existing department name |
| position | string | Required, min 2 characters |
| employmentType | string | Required, one of: `Full-time`, `Part-time`, `Contract`, `Intern`, `Remote` |
| hireDate | string | Required, ISO date format (YYYY-MM-DD) |
| status | string | Required, one of: `Active`, `Inactive`, `Probation`, `Resigned`, `Terminated` |

---

### 2.4 Update Employee

Update one or more fields of an employee record. Supports partial updates.

**`PUT /employees/:id`**

**Request Body (partial — any combination):**

```json
{
  "firstName": "Jonathan",
  "lastName": "Doe",
  "email": "jonathan.doe@company.com",
  "phoneNumber": "+1 555 987 6543",
  "gender": "Male",
  "dob": "1990-03-15",
  "address": "456 Oak St, New York, NY",
  "emergencyContact": "Jane Doe (+1 555 987 6542)",
  "department": "Design",
  "position": "Senior UX Designer",
  "employmentType": "Full-time",
  "hireDate": "2024-06-01",
  "reportingManager": "Brooklyn Simmons",
  "status": "Active",
  "photoUrl": "https://cdn.staffsync.com/photos/EMP-26-07-002.jpg"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "id": "EMP-26-07-002",
    "firstName": "Jonathan",
    "lastName": "Doe",
    "email": "jonathan.doe@company.com",
    "status": "Active"
  }
}
```

---

### 2.5 Delete Employee

Remove an employee record from the system.

**`DELETE /employees/:id`**

**Success Response (200):**

```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Employee not found"
}
```

---

### 2.6 Update Employee Salary

Update an employee's compensation details.

**`PUT /employees/:id/salary`**

**Request Body:**

```json
{
  "baseSalary": 9500,
  "bonus": 2000,
  "allowances": 500
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "EMP-26-07-001",
    "salary": {
      "baseSalary": 9500,
      "bonus": 2000,
      "allowances": 500
    }
  }
}
```

---

### 2.7 Update Employee Bank Account

Update an employee's bank details for payroll.

**`PUT /employees/:id/bank`**

**Request Body:**

```json
{
  "bankName": "Chase Bank",
  "accountName": "Brooklyn Simmons",
  "accountNumber": "1234567890"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "EMP-26-07-001",
    "bankAccount": {
      "bankName": "Chase Bank",
      "accountName": "Brooklyn Simmons",
      "accountNumber": "1234567890"
    }
  }
}
```

---

### 2.8 Employee Education Records

#### 2.8.1 Add Education Record

**`POST /employees/:id/education`**

**Request Body:**

```json
{
  "institutionName": "MIT",
  "degree": "Master of Computer Science",
  "qualification": "M.CompSc",
  "fieldOfStudy": "Artificial Intelligence",
  "graduationYear": "2020"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "edu-3",
    "institutionName": "MIT",
    "degree": "Master of Computer Science",
    "qualification": "M.CompSc",
    "fieldOfStudy": "Artificial Intelligence",
    "graduationYear": "2020"
  }
}
```

#### 2.8.2 Delete Education Record

**`DELETE /employees/:id/education/:educationId`**

**Success Response (200):**

```json
{
  "success": true,
  "message": "Education record deleted"
}
```

---

### 2.9 Employee Documents

#### 2.9.1 Add Document

**`POST /employees/:id/documents`**

> **Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Rules |
|-------|--------|---------------------------------------------|
| file | File | Required, PDF or image, max 10MB |
| name | string | Required, document display name |
| type | string | Required: `Resume`, `Employment Letter`, `Certificates`, `Other Documents` |

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "doc-5",
    "name": "Contract_Signed.pdf",
    "type": "Employment Letter",
    "uploadDate": "2025-07-01",
    "fileUrl": "https://cdn.staffsync.com/documents/doc-5.pdf"
  }
}
```

#### 2.9.2 Delete Document

**`DELETE /employees/:id/documents/:documentId`**

**Success Response (200):**

```json
{
  "success": true,
  "message": "Document deleted"
}
```

---

### 2.10 Employee Notes

#### 2.10.1 Add Note

**`POST /employees/:id/notes`**

**Request Body:**

```json
{
  "text": "Employee is performing exceptionally well this quarter."
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "n-15",
    "text": "Employee is performing exceptionally well this quarter.",
    "createdDate": "2025-07-01"
  }
}
```

#### 2.10.2 Delete Note

**`DELETE /employees/:id/notes/:noteId`**

**Success Response (200):**

```json
{
  "success": true,
  "message": "Note deleted"
}
```

---

## 3. Departments

---

### 3.1 List Departments

Get all departments with employee counts.

**`GET /departments`**

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "id": "DES-26-07-001",
        "name": "Design",
        "abbreviation": "DES",
        "description": "User interface design, experience planning, and product aesthetics research.",
        "head": "Brooklyn Simmons",
        "employeeCount": 12,
        "dateCreated": "2024-01-10"
      },
      {
        "id": "DEV-26-07-002",
        "name": "Development",
        "abbreviation": "DEV",
        "description": "Engineering, stack architecture, DevOps.",
        "head": "Cody Fisher",
        "employeeCount": 8,
        "dateCreated": "2024-01-12"
      }
    ]
  }
}
```

---

### 3.2 Get Single Department

Get department details and its members.

**`GET /departments/:id`**

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "department": {
      "id": "DES-26-07-001",
      "name": "Design",
      "abbreviation": "DES",
      "description": "User interface design, experience planning, and product aesthetics research.",
      "head": "Brooklyn Simmons",
      "dateCreated": "2024-01-10"
    },
    "members": [
      {
        "id": "EMP-26-07-001",
        "firstName": "Brooklyn",
        "lastName": "Simmons",
        "email": "brok-simms@mail.com",
        "position": "Creative Director",
        "status": "Active",
        "hireDate": "2024-01-10",
        "photoUrl": "https://cdn.staffsync.com/photos/EMP-26-07-001.jpg"
      }
    ]
  }
}
```

---

### 3.3 Create Department

**`POST /departments`**

**Request Body:**

```json
{
  "name": "DevOps",
  "description": "Infrastructure, CI/CD, and cloud services management.",
  "head": "John Doe"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "DEV-26-07-003",
    "name": "DevOps",
    "abbreviation": "DEV",
    "description": "Infrastructure, CI/CD, and cloud services management.",
    "head": "John Doe",
    "dateCreated": "2025-07-01"
  }
}
```

**Validation:**
| Field | Type | Rules |
|------------|--------|--------------------------------------------|
| name | string | Required, unique department name (abbreviation auto-generated) |
| description| string | Optional |
| head | string | Required, defaults to `"Not assigned"` |

---

### 3.4 Update Department

**`PUT /departments/:id`**

**Request Body (partial):**

```json
{
  "name": "Design & UX",
  "description": "Updated description for Design department.",
  "head": "Jane Smith"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Department updated successfully"
}
```

---

### 3.5 Delete Department

**`DELETE /departments/:id`**

**Success Response (200):**

```json
{
  "success": true,
  "message": "Department deleted successfully"
}
```

---

## 4. Dashboard

### 4.1 Get Dashboard Statistics

Aggregated counts and metrics for the overview page.

**`GET /dashboard/stats`**

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "totalEmployees": 34,
    "activeEmployees": 28,
    "inactiveEmployees": 6,
    "totalDepartments": 4,
    "newEmployeesThisMonth": 3,
    "employeesByDepartment": [
      {
        "department": "Design",
        "count": 12,
        "percentage": 35.3
      },
      {
        "department": "Development",
        "count": 8,
        "percentage": 23.5
      }
    ],
    "statusDistribution": {
      "active": 28,
      "inactive": 3,
      "probation": 2,
      "resigned": 1,
      "terminated": 0
    },
    "recentEmployees": [
      {
        "id": "EMP-26-07-002",
        "firstName": "John",
        "lastName": "Doe",
        "department": "Development",
        "position": "Software Engineer",
        "hireDate": "2025-07-01",
        "photoUrl": null
      }
    ],
    "growthTrend": {
      "labels": ["Q1", "Q2", "Q3", "Q4"],
      "data": [20, 25, 30, 34]
    }
  }
}
```

---

## 5. Reports

### 5.1 Employee Summary Report

Get aggregate employee data for the reports page.

**`GET /reports/employee-summary`**

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "totalEmployees": 34,
    "activeEmployees": 28,
    "inactiveEmployees": 6,
    "totalDepartments": 4,
    "employeesPerDepartment": [
      {
        "department": "Design",
        "count": 12,
        "percentage": 35.3
      }
    ]
  }
}
```

---

### 5.2 Salary Summary Report

Get payroll and compensation data.

**`GET /reports/salary-summary`**

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "totalMonthlyPayroll": 245000,
    "averageCompensation": 7205,
    "highestPaid": 10500,
    "salaryDistributionByDepartment": [
      {
        "department": "Design",
        "averageSalary": 8200,
        "totalPayroll": 98400,
        "employeeCount": 12
      },
      {
        "department": "Development",
        "averageSalary": 6800,
        "totalPayroll": 54400,
        "employeeCount": 8
      }
    ]
  }
}
```

---

### 5.3 Hiring Trend Report

Get employee growth data over time.

**`GET /reports/hiring-trend`**

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|--------|---------|------------------------------------------|
| period | string | `monthly` | Aggregation period: `monthly`, `quarterly`, `yearly` |
| months | integer | 12 | Number of months to look back |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "labels": ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
    "data": [28, 22, 24, 18, 14, 10, 5]
  }
}
```

---

### 5.4 Export Reports

Generate and download a report in the specified format.

**`GET /reports/export`**

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|--------|---------|------------------------------------------|
| type | string | — | Report type: `employee-summary`, `salary-summary`, `hiring-trend` |
| format | string | `csv` | Export format: `csv`, `xlsx`, `pdf` |

**Success Response (200):**  
Returns the file as a downloadable binary stream with appropriate `Content-Type` and `Content-Disposition` headers.

---

## 6. Settings

### 6.1 Get Settings

**`GET /settings`**

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "company": {
      "id": "comp-1",
      "name": "Rocks Company Ltd",
      "description": "Corporate Headquarters",
      "email": "contact@rockscompany.com",
      "phoneNumber": "+2348129887896",
      "address": {
        "state": "FCT",
        "lga": "Municipal",
        "settlement": "Wuse 2",
        "street": "42 Michael Okpara Street, House 7"
      }
    }
  }
}
```

---

### 6.2 Update Company Information

**`PUT /settings/company`**

**Request Body:**

```json
{
  "name": "Rocks Company Ltd",
  "description": "Corporate Headquarters",
  "email": "contact@rockscompany.com",
  "phoneNumber": "+2348129887896",
  "address": {
    "state": "FCT",
    "lga": "Municipal",
    "settlement": "Wuse 2",
    "street": "42 Michael Okpara Street, House 7"
  }
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Company information updated successfully",
  "data": {
    "company": {
      "name": "Rocks Company Ltd",
      "description": "Corporate Headquarters",
      "email": "contact@rockscompany.com",
      "phoneNumber": "+2348129887896",
      "address": {
        "state": "FCT",
        "lga": "Municipal",
        "settlement": "Wuse 2",
        "street": "42 Michael Okpara Street, House 7"
      }
    }
  }
}
```

---

## 7. File Uploads

### 7.1 Upload File

Upload employee documents, profile photos, or any attachment.

**`POST /upload`**

> **Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Rules |
|-----------|--------|------------------------------------------------------|
| file | File | Required. Max 10MB. Allowed: PDF, DOC, DOCX, PNG, JPG, JPEG, GIF |
| directory | string | Optional. Target folder: `documents`, `photos`, `general`. Default: `general` |

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "fileUrl": "https://cdn.staffsync.com/uploads/doc-5.pdf",
    "fileName": "Contract_Signed.pdf",
    "fileSize": 245000,
    "mimeType": "application/pdf",
    "uploadDate": "2025-07-01T10:30:00Z"
  }
}
```

---

## 8. Data Models

### Employee

```json
{
  "id": "string (auto-generated, format: EMP-YY-MM-SEQ)",
  "firstName": "string",
  "lastName": "string",
  "email": "string (unique)",
  "phoneNumber": "string",
  "gender": "string (Male | Female | Other)",
  "dob": "string (ISO date, optional)",
  "address": "string (optional)",
  "emergencyContact": "string (optional)",
  "department": "string (references Department.name)",
  "position": "string",
  "employmentType": "string (Full-time | Part-time | Contract | Intern | Remote)",
  "hireDate": "string (ISO date)",
  "reportingManager": "string (optional)",
  "status": "string (Active | Inactive | Probation | OnLeave | Resigned | Terminated)",
  "photoUrl": "string (optional, URL to image)",
  "education": "Education[]",
  "salary": "Salary",
  "bankAccount": "BankAccount",
  "documents": "Document[]",
  "notes": "Note[]",
  "createdAt": "string (ISO datetime)",
  "updatedAt": "string (ISO datetime)"
}
```

### Department

```json
{
  "id": "string (auto-generated, format: dep-xxx)",
  "name": "string (unique)",
  "description": "string",
  "head": "string",
  "dateCreated": "string (ISO date)"
}
```

### Education

```json
{
  "id": "string (auto-generated, format: edu-xxx)",
  "institutionName": "string",
  "degree": "string",
  "qualification": "string",
  "fieldOfStudy": "string",
  "graduationYear": "string (year)"
}
```

### Salary

```json
{
  "baseSalary": "number (monthly)",
  "bonus": "number (monthly)",
  "allowances": "number (monthly)"
}
```

### BankAccount

```json
{
  "bankName": "string",
  "accountName": "string",
  "accountNumber": "string"
}
```

### Document

```json
{
  "id": "string (auto-generated, format: doc-xxx)",
  "name": "string",
  "type": "string (Resume | Employment Letter | Certificates | Other Documents)",
  "uploadDate": "string (ISO date)",
  "fileUrl": "string (URL to file)"
}
```

### Note

```json
{
  "id": "string (auto-generated, format: n-xxx)",
  "text": "string",
  "createdDate": "string (ISO date)"
}
```

### Admin Profile

```json
{
  "name": "string",
  "email": "string",
  "profilePicture": "string (URL)"
}
```

### Company Info

```json
{
  "name": "string",
  "email": "string",
  "phoneNumber": "string",
  "address": "string"
}
```

### Common Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": {
    "fieldName": ["Validation error message"]
  }
}
```

| HTTP Status | Meaning                              |
| ----------- | ------------------------------------ |
| 200         | OK — Success                         |
| 201         | Created — Resource created           |
| 400         | Bad Request — Validation error       |
| 401         | Unauthorized — Missing/invalid token |
| 403         | Forbidden — Insufficient permissions |
| 404         | Not Found — Resource doesn't exist   |
| 500         | Internal Server Error                |

---

## Endpoints Summary

| #   | Method | Endpoint                          | Description                    |
| --- | ------ | --------------------------------- | ------------------------------ |
| 1   | POST   | `/auth/login`                     | User login                     |
| 2   | POST   | `/auth/register`                  | Create account / register org  |
| 3   | POST   | `/auth/forgot-password`           | Request password reset         |
| 4   | PUT    | `/auth/change-password`           | Change password                |
| 5   | GET    | `/employees`                      | List employees (paginated)     |
| 6   | GET    | `/employees/:id`                  | Get employee full profile      |
| 7   | POST   | `/employees`                      | Create new employee            |
| 8   | PUT    | `/employees/:id`                  | Update employee                |
| 9   | DELETE | `/employees/:id`                  | Delete employee                |
| 10  | PUT    | `/employees/:id/salary`           | Update salary                  |
| 11  | PUT    | `/employees/:id/bank`             | Update bank account            |
| 12  | POST   | `/employees/:id/education`        | Add education record           |
| 13  | DELETE | `/employees/:id/education/:eduId` | Delete education record        |
| 14  | POST   | `/employees/:id/documents`        | Upload document                |
| 15  | DELETE | `/employees/:id/documents/:docId` | Delete document                |
| 16  | POST   | `/employees/:id/notes`            | Add note                       |
| 17  | DELETE | `/employees/:id/notes/:noteId`    | Delete note                    |
| 18  | GET    | `/departments`                    | List departments               |
| 19  | GET    | `/departments/:id`                | Get department + members       |
| 20  | POST   | `/departments`                    | Create department              |
| 21  | PUT    | `/departments/:id`                | Update department              |
| 22  | DELETE | `/departments/:id`                | Delete department              |
| 23  | GET    | `/dashboard/stats`                | Dashboard overview statistics  |
| 24  | GET    | `/reports/employee-summary`       | Employee summary report        |
| 25  | GET    | `/reports/salary-summary`         | Salary/payroll report          |
| 26  | GET    | `/reports/hiring-trend`           | Hiring growth trend data       |
| 27  | GET    | `/reports/export`                 | Export report as CSV/Excel/PDF |
| 28  | GET    | `/settings`                       | Get company settings           |
| 29  | PUT    | `/settings/company`               | Update company info            |
| 31  | POST   | `/upload`                         | Upload file (documents/photos) |

---

> **Notes for the Backend Team:**
>
> - Employee IDs follow the format `EMP-YY-MM-SEQ`, Department IDs follow `ABB-YY-MM-SEQ`.
> - The `department` field on an employee references `Department.name` (not the ID). Consider whether to use a `departmentId` foreign key instead for better normalization.
> - The `photoUrl` on employees can be a file upload URL or an external URL (e.g., from Unsplash).
> - Document uploads will likely require file storage integration (S3, Cloudinary, etc.).
> - The `reports/export` endpoint should stream the file for download.
> - Pagination metadata (`page`, `limit`, `totalItems`, `totalPages`) is expected on all list endpoints.
> - All timestamps should be in ISO 8601 format (UTC).
