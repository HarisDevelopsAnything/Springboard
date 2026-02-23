# WellNest Admin System Documentation

## Overview
This document describes the new admin functionality added to WellNest, including admin dashboard, user management, and customer reporting system.

## Admin Account
- **Username:** `wellnest_admin`
- **Password:** `WellNest@2026`
- **Email:** `admin@wellnest.com`

The admin account is automatically created when the backend starts for the first time.

## Features Implemented

### Backend (Spring Boot)

#### 1. **Entities**
- **Report** (`Report.java`) - Stores customer reports against trainers
  - Fields: customer info, trainer info, message, status, timestamps
  - Status: PENDING, REVIEWED, RESOLVED, DISMISSED
- **ReportStatus** (`ReportStatus.java`) - Enum for report statuses

#### 2. **DTOs**
- `CreateReportRequest` - For customers to submit reports
- `ReportDTO` - For returning report data
- `AdminDashboardStats` - Dashboard statistics
- `UserListDTO` - User listing information

#### 3. **Repositories**
- `ReportRepository` - MongoDB repository for reports
  - Methods for filtering by status, customer, trainer
  - Count pending reports

#### 4. **Services**
- **AdminService** (`AdminService.java`)
  - `initializeAdminAccount()` - Creates default admin on startup
  - `getDashboardStats()` - Returns statistics
  - `getAllCustomers()` - List all customers
  - `getAllTrainers()` - List all trainers with assigned clients
  - `deleteUser(userId)` - Delete user (protects admin accounts)

- **ReportService** (`ReportService.java`)
  - `createReport()` - Customer creates report
  - `getAllReports()` - Admin views all reports
  - `getPendingReports()` - Get reports needing review
  - `updateReportStatus()` - Admin updates report status
  - `deleteReport()` - Admin deletes report

#### 5. **Controllers**
- **AdminController** (`/api/admin/*`)
  - `GET /api/admin/stats` - Dashboard statistics
  - `GET /api/admin/customers` - List all customers
  - `GET /api/admin/trainers` - List all trainers
  - `DELETE /api/admin/users/{userId}` - Delete user

- **ReportController** (`/api/reports/*`)
  - `POST /api/reports` - Create report (customer only)
  - `GET /api/reports/my-reports` - Get customer's reports
  - `GET /api/reports` - Get all reports (admin only)
  - `GET /api/reports/pending` - Get pending reports (admin only)
  - `PATCH /api/reports/{reportId}/status` - Update status (admin)
  - `DELETE /api/reports/{reportId}` - Delete report (admin)
  - `GET /api/reports/trainer/{trainerId}` - Get trainer reports (admin)

### Frontend (React)

#### 1. **Services**
- `adminService.js` - API calls for admin operations
- `reportService.js` - API calls for report operations

#### 2. **Pages**
- **AdminLogin** (`/admin/login`)
  - Dedicated login page for admins
  - Validates admin role after login
  - Redirects to admin dashboard

- **AdminDashboard** (`/admin/dashboard`)
  - Statistics cards (users, trainers, reports, assignments)
  - Tabbed interface:
    - **Statistics** - Overview
    - **Customers** - List and manage customers
    - **Trainers** - List and manage trainers with client counts
    - **Reports** - View and manage reports with notification badge
  - Actions:
    - Delete users (customers/trainers)
    - View report details
    - Update report status (Reviewed, Resolved, Dismissed)
    - Delete reports

#### 3. **Components**
- **ReportModal** - Modal for customers to report trainers
  - Select trainer from dropdown
  - Enter detailed message (min 10 characters)
  - Submit to admin for review

#### 4. **Dashboard Integration**
- Added "Report a Trainer" button to customer dashboard
- Displays report modal when clicked
- Info message about reporting process

## API Endpoints Summary

### Admin Endpoints (Requires ROLE_ADMIN)
```
GET    /api/admin/stats              - Dashboard statistics
GET    /api/admin/customers          - List all customers
GET    /api/admin/trainers           - List all trainers
DELETE /api/admin/users/{userId}     - Delete a user
```

### Report Endpoints
```
# Customer endpoints (Requires ROLE_USER)
POST   /api/reports                  - Create report
GET    /api/reports/my-reports       - Get my reports

# Admin endpoints (Requires ROLE_ADMIN)
GET    /api/reports                  - Get all reports
GET    /api/reports/pending          - Get pending reports
PATCH  /api/reports/{id}/status      - Update report status
DELETE /api/reports/{id}             - Delete report
GET    /api/reports/trainer/{id}     - Get reports for trainer
```

## Security
- Method-level security with `@PreAuthorize`
- Admin routes require `ROLE_ADMIN`
- Report creation requires `ROLE_USER`
- Admin accounts cannot be deleted
- JWT authentication required for all protected endpoints

## Database Collections
- `users` - Contains all users including admin (role: ROLE_ADMIN)
- `reports` - Stores customer reports against trainers

## Usage Flow

### For Admin:
1. Navigate to `/admin/login`
2. Login with admin credentials
3. View dashboard statistics
4. Manage users via tabs:
   - View all customers/trainers
   - Delete problematic users
5. Review reports:
   - See pending reports with notification badge
   - Read customer complaints
   - Mark as Reviewed, Resolved, or Dismissed
   - Delete reports if needed

### For Customer:
1. Access customer dashboard
2. Click "Report a Trainer" button
3. Select trainer from dropdown
4. Provide detailed reason
5. Submit report
6. Admin receives notification and can review

## Styling
- Consistent with existing WellNest design
- Glassmorphism effects
- Color-coded status badges:
  - Yellow: Pending
  - Blue: Reviewed
  - Green: Resolved
  - Gray: Dismissed
- Responsive design for mobile/tablet
- Smooth animations and transitions

## Testing
1. Start backend: `./mvnw spring-boot:run`
2. Start frontend: `npm run dev`
3. Login as admin at: `http://localhost:5173/admin/login`
   - Username: `wellnest_admin`
   - Password: `WellNest@2026`
4. Test user management and report system

## Notes
- Admin account is created automatically on first startup
- Delete operations cascade (deleting trainer removes their assignments)
- Reports store denormalized data (customer/trainer names) for historical reference
- Property warnings in application.properties are normal (custom properties)

## Future Enhancements
- Email notifications for admins on new reports
- Bulk user operations
- Advanced filtering and search
- Report analytics and trends
- Admin activity logs
