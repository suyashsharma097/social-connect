# Social Connect - Employee & Leave Management System

A production-ready, enterprise-grade Full Stack Employee and Leave Management System built using the Controller-Service-Repository architecture. 

---

## 🌟 Key Features

### 🔐 1. Authentication & Security
- **JWT Double-Token System**: Implements short-lived access tokens and long-lived refresh tokens.
- **Auto-Refresh Interceptor**: Frontend automatically intercepts `401 Unauthorized` token expiry errors, silently requests a new access token, and replays the original failed requests.
- **Account Verification & Recovery**: Support for registration email verification links and password recovery resets.
- **Role-Based Access Control (RBAC)**: Strict route guarding for `ADMIN`, `HR`, `MANAGER`, and `EMPLOYEE` permissions.

### 👥 2. Employee Profile Management (CRUD)
- **Multi-File Uploads**: Supports uploads of avatar profile pictures, PDF/DOCX resumes, and multi-file attachments using **Multer**.
- **Skills Profiler**: Many-to-many relationship linking employees to skills with proficiency scales (Beginner, Intermediate, Advanced).
- **Department Association**: Grouping profiles by business unit (Engineering, HR, Sales).

### 📅 3. Leave Workflows & Approval Pipelines
- **Deduction Engine**: Approving leave automatically decrements the employee's allocated leave balance in database transactions.
- **Workflow Approvals**: Employees apply for leaves, sending requests to `PENDING_MANAGER` status. Managers approve it to `PENDING_HR`, and HR specialists finalize it.
- **Validation Check**: Prevents applying for paid leaves that exceed the available balance.

### 🖥️ 4. Asset Inventory Allocation
- Tracks corporate hardware (Computers, Monitors, Accessories) with unique serial numbers.
- Managers can allocate active assets to employees and record device returns.

---

## 🏗️ Technical Stack

- **Frontend**: React.js (Vite), Redux Toolkit (State management), React Router, Lucide Icons, Vanilla CSS (Glassmorphism, custom dark mode, HSL parameters).
- **Backend**: Node.js & Express.js (ES Modules), Winston Logger, Joi schema validator, Multer file parser, Node-Cron background scheduler, Nodemailer mailer.
- **Database**: PostgreSQL database access mediated by **Prisma ORM**.
- **Deployment**: Multi-stage **Docker** configurations and **Docker-compose**.

---

## 📂 Production Directory Structure

```
internship/
├── backend/
│   ├── prisma/             # Schema configuration, migrations, and seed scripts
│   ├── src/
│   │   ├── config/         # Database client, environment checks, logger, mailer
│   │   ├── controllers/    # API request handlers mapping endpoints
│   │   ├── services/       # Core business logics and transactions
│   │   ├── repositories/   # Abstracted Prisma query operations
│   │   ├── middleware/     # Auth, error, and validation interceptors
│   │   ├── validations/    # Joi request body schemas
│   │   ├── routes/         # Router hierarchies versioned under /v1
│   │   ├── jobs/           # Node-cron background schedules
│   │   └── app.js & server.js
│   ├── tests/              # Jest endpoint testing suite
│   ├── uploads/            # Multipart uploaded files storage
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── store/          # Redux state slices (auth, employee, leave, assets)
│   │   ├── services/       # Axios API client interceptor
│   │   ├── router/         # Protected routes and role guards
│   │   ├── layouts/        # Sidebar dashboard frame
│   │   ├── pages/          # Login, Signup, Dashboard, CRUD lists
│   │   ├── index.css       # Global Vanilla CSS theme
│   │   └── App.jsx & main.jsx
│   ├── index.html
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml      # Orchestration metadata
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL service running on port 5432
- *Optional*: Docker Desktop

### 1. Database Configuration
1. Open the local PostgreSQL database server.
2. Configure `.env` inside the `backend/` folder:
   ```env
   PORT=5001
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:Suyash%40123@localhost:5432/employee_management?schema=public"
   JWT_ACCESS_SECRET=your_jwt_access_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   ```

### 2. Launch Local Servers
Open a terminal in the project directory:

```bash
# Set up and migrate backend
cd backend
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev # Starts API backend on http://social-connect-production-80fd.up.railway.app

# Set up and run frontend
cd ../frontend
npm install
npm run dev # Starts Vite app on http://localhost:5173
```

- **Default Administrator Credentials**:
  - Email: `admin@social-connect.com`
  - Password: `admin123`

---

## 🐳 Docker Deployment

To build and orchestrate the entire container stack (PostgreSQL + Express API + Nginx Static App):

```bash
docker-compose up --build
```
- Frontend will be accessible at: `http://localhost` (Port 80)
- Backend API will be accessible at: `http://localhost:5000` (Port 5000)
