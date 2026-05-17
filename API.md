# AtomQuest API Documentation

Complete API reference for all endpoints in the AtomQuest goal-tracking system.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints except `/auth/login` and `/auth/register` require a valid JWT token in an HTTP-only cookie.

### Error Responses

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication failed"
}
```

---

## Authentication Endpoints

### Login
```
POST /auth/login
```

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "EMPLOYEE"
    },
    "token": "jwt-token"
  }
}
```

### Register
```
POST /auth/register
```

**Request Body**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "newuser@example.com",
    "name": "User Name"
  }
}
```

### Logout
```
POST /auth/logout
```

**Response (200)**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User
```
GET /auth/me
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "EMPLOYEE",
    "departmentId": "dept-id"
  }
}
```

---

## Goal Sheets Endpoints

### List Goal Sheets
```
GET /goal-sheets?page=1&limit=10&status=DRAFT
```

**Query Parameters**
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page
- `status` (optional): Filter by status (DRAFT, SUBMITTED, APPROVED, REJECTED, LOCKED)

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": "sheet-id",
      "title": "Q1 2026 Goals",
      "description": "Goals for Q1",
      "status": "DRAFT",
      "cycle": {
        "id": "cycle-id",
        "quarter": "Q1"
      },
      "goals": [],
      "createdAt": "2026-05-17T10:00:00Z"
    }
  ]
}
```

### Create Goal Sheet
```
POST /goal-sheets
```

**Request Body**
```json
{
  "title": "Q1 2026 Goals",
  "description": "My goals for Q1",
  "cycleId": "cycle-id"
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "sheet-id",
    "title": "Q1 2026 Goals",
    "status": "DRAFT"
  }
}
```

### Get Goal Sheet
```
GET /goal-sheets/[id]
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": "sheet-id",
    "title": "Q1 2026 Goals",
    "description": "My goals for Q1",
    "status": "DRAFT",
    "goals": [
      {
        "id": "goal-id",
        "title": "Implement new feature",
        "description": "Build user authentication",
        "targetDate": "2026-03-31T00:00:00Z"
      }
    ]
  }
}
```

### Update Goal Sheet
```
PUT /goal-sheets/[id]
```

**Request Body**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": { ...updated goal sheet... }
}
```

### Submit Goal Sheet
```
POST /goal-sheets/[id]/submit
```

**Response (200)**
```json
{
  "success": true,
  "message": "Goal sheet submitted for approval",
  "data": { ...goal sheet with status SUBMITTED... }
}
```

### Delete Goal Sheet
```
DELETE /goal-sheets/[id]
```

**Response (200)**
```json
{
  "success": true,
  "message": "Goal sheet deleted"
}
```

---

## Goals Endpoints

### Create Goal
```
POST /goals
```

**Request Body**
```json
{
  "title": "Implement authentication",
  "description": "Build JWT-based authentication system",
  "targetDate": "2026-03-31T00:00:00Z",
  "goalSheetId": "sheet-id",
  "weight": 30
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "goal-id",
    "title": "Implement authentication",
    "status": "ACTIVE"
  }
}
```

### Get Goal
```
GET /goals/[id]
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": "goal-id",
    "title": "Implement authentication",
    "description": "Build JWT-based authentication system",
    "targetDate": "2026-03-31T00:00:00Z",
    "currentProgress": 50,
    "status": "ACTIVE"
  }
}
```

### Update Goal
```
PUT /goals/[id]
```

**Request Body**
```json
{
  "title": "Updated goal title",
  "description": "Updated description",
  "targetDate": "2026-04-15T00:00:00Z"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": { ...updated goal... }
}
```

### Delete Goal
```
DELETE /goals/[id]
```

**Response (200)**
```json
{
  "success": true,
  "message": "Goal deleted"
}
```

---

## Approvals Endpoints

### Approve Goal Sheet
```
POST /approvals/[id]/approve
```

**Request Body**
```json
{
  "comments": "Approved. Great goals for Q1."
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Goal sheet approved",
  "data": { ...approval record... }
}
```

### Reject Goal Sheet
```
POST /approvals/[id]/reject
```

**Request Body**
```json
{
  "comments": "Please revise goals 2 and 3."
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Goal sheet rejected",
  "data": { ...approval record... }
}
```

### Return for Revision
```
POST /approvals/[id]/return
```

**Request Body**
```json
{
  "comments": "Minor adjustments needed."
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Goal sheet returned for revision",
  "data": { ...approval record... }
}
```

---

## Cycles Endpoints

### List Cycles
```
GET /cycles?status=ACTIVE
```

**Query Parameters**
- `status` (optional): Filter by status (ACTIVE, COMPLETED, ARCHIVED)

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": "cycle-id",
      "quarter": "Q1",
      "year": 2026,
      "status": "ACTIVE",
      "startDate": "2026-01-01T00:00:00Z",
      "endDate": "2026-03-31T23:59:59Z"
    }
  ]
}
```

### Create Cycle (Admin Only)
```
POST /cycles
```

**Request Body**
```json
{
  "quarter": "Q2",
  "year": 2026,
  "startDate": "2026-04-01T00:00:00Z",
  "endDate": "2026-06-30T23:59:59Z"
}
```

**Response (201)**
```json
{
  "success": true,
  "data": { ...cycle... }
}
```

### Get Cycle
```
GET /cycles/[id]
```

**Response (200)**
```json
{
  "success": true,
  "data": { ...cycle details... }
}
```

### Update Cycle (Admin Only)
```
PUT /cycles/[id]
```

**Request Body**
```json
{
  "status": "COMPLETED"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": { ...updated cycle... }
}
```

---

## Checkins Endpoints

### Create Checkin
```
POST /checkins
```

**Request Body**
```json
{
  "goalId": "goal-id",
  "progressPercentage": 50,
  "comments": "Made good progress on authentication implementation"
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "checkin-id",
    "goalId": "goal-id",
    "progressPercentage": 50,
    "status": "DRAFT"
  }
}
```

### Get Checkin
```
GET /checkins/[id]
```

**Response (200)**
```json
{
  "success": true,
  "data": { ...checkin details... }
}
```

### Update Checkin
```
PUT /checkins/[id]
```

**Request Body**
```json
{
  "progressPercentage": 75,
  "comments": "Almost complete"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": { ...updated checkin... }
}
```

### Submit Checkin
```
POST /checkins/[id]/submit
```

**Response (200)**
```json
{
  "success": true,
  "message": "Checkin submitted",
  "data": { ...checkin with status SUBMITTED... }
}
```

---

## Reports Endpoints

### Summary Report
```
GET /reports/summary?cycleId=cycle-id&departmentId=dept-id
```

**Query Parameters**
- `cycleId` (optional): Filter by cycle
- `departmentId` (optional): Filter by department

**Response (200)**
```json
{
  "success": true,
  "data": {
    "totalGoalSheets": 50,
    "approvedSheets": 40,
    "pendingSheets": 8,
    "rejectedSheets": 2,
    "totalGoals": 320,
    "averageGoalsPerSheet": 6.4
  }
}
```

### Cycle Report
```
GET /reports/cycle/[id]
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "cycleId": "cycle-id",
    "quarter": "Q1",
    "totalParticipants": 50,
    "goalsSubmitted": 320,
    "averageProgress": 65,
    "completionRate": 75
  }
}
```

### Department Report
```
GET /reports/department/[id]
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "departmentId": "dept-id",
    "departmentName": "Engineering",
    "teamSize": 25,
    "totalGoals": 160,
    "averageProgress": 70,
    "topPerformers": []
  }
}
```

---

## Dashboard Endpoint

### Get Dashboard
```
GET /dashboard
```

**Response (200) - Employee**
```json
{
  "success": true,
  "data": {
    "totalGoalSheets": 3,
    "totalGoals": 18,
    "totalCheckins": 9,
    "pendingApprovals": 1,
    "completedGoalSheets": 2
  }
}
```

**Response (200) - Manager**
```json
{
  "success": true,
  "data": {
    "teamSize": 8,
    "pendingApprovals": 5,
    "completedSheets": 10,
    "averageGoalCount": 6
  }
}
```

---

## Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | BAD_REQUEST | Invalid request parameters |
| 401 | UNAUTHORIZED | Not authenticated |
| 403 | FORBIDDEN | Not authorized for action |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Business logic conflict |
| 500 | SERVER_ERROR | Internal server error |

## Rate Limiting

Currently no rate limiting is implemented. Production deployments should implement rate limiting per user/IP.

## Pagination

Endpoints supporting pagination use:
- `page`: 1-based page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response includes:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

**API Version**: 1.0.0  
**Last Updated**: 2026-05-17
