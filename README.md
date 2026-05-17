# AtomQuest - Goal Tracking Portal

A comprehensive enterprise goal management system built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## Overview

AtomQuest is a full-stack goal-tracking portal designed for managing quarterly goals across organizations. It supports multiple user roles (Admin, Manager, Employee) with sophisticated approval workflows, progress tracking, and comprehensive reporting.

### Key Features

- **Goal Management**: Create, edit, and track goals with measurable outcomes
- **Multi-level Approval Workflow**: Employees submit goal sheets for manager approval
- **Quarterly Checkins**: Track progress on goals throughout the year
- **Role-based Access Control**: Admin, Manager, and Employee dashboard views
- **Team Management**: Managers can oversee their team's goals and progress
- **Comprehensive Reporting**: Department and system-wide analytics
- **Audit Logging**: Track all mutations for compliance and accountability

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL 15, Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **Containerization**: Docker, Docker Compose

## Project Structure

```
atomquest/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (auth)/            # Auth routes (login, register)
│   │   ├── (dashboard)/       # Dashboard routes
│   │   │   ├── dashboard/     # Employee dashboard
│   │   │   ├── manager/       # Manager pages
│   │   │   └── admin/         # Admin pages
│   │   └── api/               # API routes
│   ├── components/            # Reusable React components
│   │   └── ui/               # UI components (Button, Input, etc.)
│   ├── lib/                   # Utilities and helpers
│   │   ├── auth.ts           # JWT and password management
│   │   ├── db.ts             # Prisma client
│   │   ├── session.ts        # Session management
│   │   └── validations/      # Zod schemas
│   ├── services/              # Business logic layer
│   │   ├── user.service.ts
│   │   ├── goal.service.ts
│   │   ├── approval.service.ts
│   │   └── [other services]
│   ├── styles/               # Global styles
│   └── types/                # TypeScript types
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Demo data seeding
├── docker-compose.yml        # Local development setup
├── Dockerfile               # Production build
└── next.config.js          # Next.js configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ (or use Docker)
- Docker & Docker Compose (for PostgreSQL)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd atomquest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your database URL and JWT secret:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/atomquest"
   JWT_SECRET="your-secret-key-here"
   JWT_EXPIRY="7d"
   ```

### Development

1. **Start the database**
   ```bash
   docker-compose up -d
   ```

2. **Run Prisma migrations**
   ```bash
   npx prisma migrate dev
   ```

3. **Seed demo data (optional)**
   ```bash
   npx prisma db seed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

### Demo Credentials

```
Admin:      admin@demo.com / @123
Manager:    manager1@demo.com / @123
Employee:   employee1@demo.com / @123
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Goal Sheets
- `GET /api/goal-sheets` - List user's goal sheets
- `POST /api/goal-sheets` - Create new goal sheet
- `GET /api/goal-sheets/[id]` - Get goal sheet details
- `PUT /api/goal-sheets/[id]` - Update goal sheet
- `POST /api/goal-sheets/[id]/submit` - Submit for approval
- `DELETE /api/goal-sheets/[id]` - Delete goal sheet

### Goals
- `POST /api/goals` - Create goal
- `GET /api/goals/[id]` - Get goal details
- `PUT /api/goals/[id]` - Update goal
- `DELETE /api/goals/[id]` - Delete goal

### Approvals
- `POST /api/approvals/[id]/approve` - Approve goal sheet
- `POST /api/approvals/[id]/reject` - Reject goal sheet
- `POST /api/approvals/[id]/return` - Return for revision

### Cycles
- `GET /api/cycles` - List cycles
- `POST /api/cycles` - Create cycle (admin only)
- `GET /api/cycles/[id]` - Get cycle details
- `PUT /api/cycles/[id]` - Update cycle status

### Reports
- `GET /api/reports/summary` - Summary report
- `GET /api/reports/cycle/[id]` - Cycle report
- `GET /api/reports/department/[id]` - Department report

### Dashboard
- `GET /api/dashboard` - Role-specific dashboard data

## Database Schema

### Core Models
- **User**: System users with roles (ADMIN, MANAGER, EMPLOYEE)
- **GoalSheet**: Container for quarterly goals
- **Goal**: Individual goals with key results
- **QuarterlyCheckin**: Progress updates on goals
- **ApprovalAction**: Workflow approval records
- **Cycle**: Goal planning cycles (Q1-Q4)
- **AuditLog**: Complete mutation audit trail

### Relationships
- Users have many GoalSheets
- GoalSheets have many Goals
- Managers oversee Employees through departments
- ApprovalActions track multi-step workflows

## Authentication & Authorization

### JWT Tokens
- 7-day expiration
- Stored in HTTP-only secure cookies
- Issued on login

### Role-based Access Control
```
ADMIN     → Full system access
MANAGER   → Access to team goals, approvals, reports
EMPLOYEE  → Access to own goals, sheets, checkins
```

## Building for Production

1. **Build the Docker image**
   ```bash
   docker build -t atomquest:latest .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Environment Setup**
   - Set `NODE_ENV=production`
   - Configure PostgreSQL connection
   - Set secure JWT_SECRET

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Ensure PostgreSQL is running: `docker-compose ps`
- Check DATABASE_URL in .env.local
- Run migrations: `npx prisma migrate dev`

**Port Already in Use**
- Stop the existing service on that port
- Or specify a different port in docker-compose.yml

**Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Run `npm run build` to verify production build

## Development Guidelines

### Code Organization
- Services handle business logic
- API routes orchestrate services and handle HTTP
- Components are presentational, services are stateful
- All mutations are audited

### Creating New Features
1. Define Prisma schema (if needed)
2. Create service layer with business logic
3. Add API routes for HTTP endpoints
4. Build UI components and pages
5. Add audit logging for mutations

### TypeScript Strictness
- `noUnusedLocals: false` in tsconfig.json (allow unused locals for clarity)
- `noUnusedParameters: true` (enforced)
- Use prefix `_` for intentionally unused parameters

## Support & Documentation

For detailed API documentation, see [API.md](./API.md)

For deployment guides, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## License

MIT License - See LICENSE file for details

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Commit: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-17
