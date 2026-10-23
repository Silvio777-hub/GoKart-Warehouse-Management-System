**Go-Kart Warehouse**

**Developed by JM Silvio**

An application designed for managing Go‑Kart facility operations. The system handles kart inventory, maintenance logs, automated reporting, staff communications, and administrative oversight.

**Tech Stack**

- Backend: Java 17/21, Spring Boot 3, Spring Security, JWT, JPA/Hibernate.
- Frontend: Angular 15, TypeScript, RxJS, Vanilla CSS.
- Database: PostgreSQL (Production/Docker), H2 (Development/In-memory).
- Tooling: Maven, npm, Docker & Docker Compose (Optimized with BuildKit & Health Checks).

**Prerequisites**

Before starting, ensure you have the following installed:

| Java JDK: 17 or latest | Backend Runtime        |
| Maven:    3.6+         | Backend Build          |
| Node.js: 18+ (LTS)     | Frontend Runtime       |
| Docker Desktop: Latest | Recommended Deployment |


**Deployment Options**

Option A: Docker Compose (Highly Recommended - Optimized)

The simplest way to run the entire stack in isolated containers. Now optimized for speed and reliability.

1.  Start Docker Desktop.
2.  Open a terminal in the project root.
3.  Execute: `docker compose up --build`
4.  Wait for health checks to turn green.

**Optimizations Included:**
- **Context Pruning:** Build context reduced from 260MB to <10MB using `.dockerignore`.
- **Layer Caching:** Multi-stage Dockerfiles with optimized Maven/npm caching layers.
- **Health Checks:** Automated service dependency management (DB must be healthy before Backend starts).

**Access URLs:**
- Frontend: [http://localhost:8080]
- Backend API: [http://localhost:8081/api]
- Health Status: `docker compose ps`

**Testing & Quality Assurance:**

1. **Backend Tests:**
   - Execute: `cd backend && mvn test`
   - Covers: Security (RBAC), DTO Validation, and Service Logic.

2. **Frontend Unit Tests (Containerized):**
   - Execute: `cd frontend && docker build -t swam-frontend-test -f Dockerfile.test . && docker run --rm swam-frontend-test`
   - Covers: Component lifecycle, Service integration, and UI logic.

3. **End-to-End Tests (Playwright):**
   - Execute: `cd frontend && npm run e2e`
   - Covers: Authentication flow, Dashboard navigation, and Core operational paths.

Option B: Manual Setup (Network Independent)

Use this if Docker Hub connectivity is restricted or slow.
To run the application directly from source using Maven and npm in your Command Prompt (CMD), follow these steps in two separate windows:

1. Backend (Command Prompt Window 1)
Navigate to the backend folder and run this block to set the database credentials and start the server:

cmd
cd backend
:: Set local database credentials
set SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/swam_db
set SPRING_DATASOURCE_USERNAME=swam
set SPRING_DATASOURCE_PASSWORD=swam_pass
:: Run the application directly from source
mvn spring-boot:run
2. Frontend (Command Prompt Window 2)
Navigate to the frontend folder and run these commands:

cmd
cd frontend
:: Step 1: Install dependencies (only needed once)
npm install --legacy-peer-deps
:: Step 2: Start the development server
npm start

Accessing the App
Backend Console: You will see Started SwamBackendApplication when it's ready.
Frontend Console: You will see Compiled successfully and a link to http://localhost:4200.
Open Browser: Go to http://localhost:4200.
[!IMPORTANT] Check your PostgreSQL status: Ensure the database swam_db has been created. If not, you can run the 
setup-local.bat
 file in the main folder first—it will create the database and build the backend for you!

Option C: Helper Scripts
Automated orchestration scripts for quick startup.

Windows (PowerShell):
```powershell
.\run-docker.ps1   # Runs via Docker
.\run-local.ps1    # Runs services locally
```
macOS / Linux:
```bash
chmod +x *.sh
./run-docker.sh
./run-local.sh
```

Authentication & Roles

| Role          | Username | Password   | Operational Focus                                      |
|               |          |            |                                                        |
|   Admin       |   admin  |   password | Fleet health, User Management, Global Tasks            |
|   Manager     |   manager|   password | Floor ops, Maintenance Logs, Incident & Task Ownership |
|   Staff       |   tech   |   password | Field ops, Task execution, Incident reporting          |
|   Staff       |   John   |   1234     | Field ops, Task execution, Incident reporting          |
|   Staff       |   Julia   |  1234     | Field ops, Task execution, Incident reporting          |

Key Features

Modern Premium UI
- Standardized Layout System: Global `box-sizing: border-box` and intelligent `.page-container` management for 100% containment.
- Universal Form Alignment: Implemented `.inline-action-form` utility to enforce single-row alignment for all action buttons (Create User, Add Kart, Report Incident, etc.), guaranteeing a consistent professional look across 100% of the platform.
- Glassmorphism Design: High-contrast dark aesthetic with frosted glass elements and backdrop-blur support.
- Fluid Micro-animations: Integrated loading states and toast notifications for a premium, responsive feel.

Incident Management & Prioritization (Manager-Owned)
- Two-Stage Workflow: Staff report issues -> Managers provide both Action Plan and Resolution.
- Admin Exclusion: Incident management is classified as an operational task, removing it from Admin visibility.
- Robust Reporting Engine: Backend features fail-safe PDF/CSV generation with deep error propagation. Frontend intelligently parses Blob errors to display specific reasons for failure (e.g. "No Data", "System Error") instead of generic messages.

Kart & Fleet Operations
- Parts Threshold Alert System: Automated restock alerts trigger "Critical Inventory Warnings" on the Manager's dashboard when parts hit minimum safety levels.
- Automated Reordering Workflow: Technicians can request parts; Managers approve them, which automatically deducts from live inventory levels.
- Real-time Inventory: Live status tracking and engine hour management with audit-logged resets.
- Maintenance Lifecycle: Detailed technician logging with manager verification and automated scheduling.
- **Maintenance Calendar**: Visual monthly grid for fleet management, allowing staff to track upcoming and overdue service protocols at a glance.
- Pit Stop Tracking: Fast-track logging for race-day turnarounds, fully audit-tracked.
- **Automated Stock Requisition**: Part Requests are now integrated with live inventory; approving a request automatically handles unit deduction and audit logging.
- **Real-Time Collaboration**: Full WebSocket integration ensures that updates (tasks, inventory, fleet status) are instantly synchronized across all connected devices without manual refreshing.
- **Instant Response UI**: Implemented "Optimistic UI" patterns for zero-latency interactions. Actions like updating statuses or resolving incidents reflect immediately, with background synchronization handling the network layer.

Enterprise Documentation & Security
- Hardened Reporting: High-reliability PDF and CSV generation with defensive null-safety guardrails and `commons-logging` stability.
- Audit Logs: Comprehensive system-wide tracking of administrative and staff actions. Accessible via the **Audit Logs** menu for administrators.
- JWT Authorization: Stateful token validation with strict role-gating (RBAC) at both UI and API levels.
- **Strict User Isolation**: Enhanced privacy controls with backend "No-Cache" policies and frontend session wiping to prevent data leaks on shared workstations.
- OpenAPI/Swagger: Interactive API documentation available at `http://localhost:8081/swagger-ui.html`.

**Common Issues & Fixes**

Docker Build Network Error (TLS Handshake Timeout)
Symptom: `Head "https://registry-1.docker.io...": net/http: TLS handshake timeout`.
Fix: This is a temporary network/CDN issue. Use the provided `docker-build-retry.bat` for automatic retries, or follow **Option B (Manual Setup)** to bypass Docker Hub entirely.

Optimization Check
The project now includes `DOCKER_OPTIMIZATION.md` for full technical details on build speedups and health management.

**Summary****
The Go Kart Warehouse application is a state-of-the-art management tool architected for operational realism and technical stability. The system is fully containerized and ready for enterprise-scale deployment.

**Buon Fortuna**

Document Version: 1.3
Last Updated: January 27, 2026
