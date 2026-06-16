# OpsMind - AI-Powered Observability & Incident Intelligence Platform

An enterprise-grade SaaS platform for observability, incident management, and AI-powered root cause analysis.

![Status](https://img.shields.io/badge/Status-Development-blue)
![Java](https://img.shields.io/badge/Java-21-orange)
![Spring%20Boot](https://img.shields.io/badge/Spring%20Boot-3.3-green)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Docker](https://img.shields.io/badge/Docker-Latest-2496ED)

## 📋 Overview

OpsMind is a comprehensive observability and incident intelligence platform designed for modern DevOps teams. It combines real-time monitoring, intelligent alerting, log analytics, and AI-powered root cause analysis to help teams detect, understand, and resolve production incidents faster.

### Key Features

- **Real-time Monitoring** - Collect and visualize metrics from applications and infrastructure
- **Incident Management** - Track, assign, and resolve incidents with full context
- **AI-Powered RCA** - Automatically analyze logs and metrics to identify root causes
- **Log Analytics** - Full-text search across billions of log entries
- **Alert Intelligence** - Smart alerting with correlation and deduplication
- **Team Collaboration** - Comments, escalations, and handoffs
- **Reporting & Analytics** - Compliance and trend reports

## 🏗️ Technology Stack

**Frontend:**
- React 19 with TypeScript
- Vite (fast builds)
- Tailwind CSS 3 + ShadCN UI
- React Query + Zustand
- Axios with JWT auth

**Backend:**
- Spring Boot 3.3 (Java 21)
- Spring Security + JWT
- Spring Data JPA + Hibernate
- MySQL 8.0

**Infrastructure:**
- Docker Compose (local dev)
- Kubernetes + Helm (production)
- AWS (S3, RDS, ElastiCache, ECS, EKS)
- GitHub Actions (CI/CD)

## 📁 Project Structure

```
opsmind/
├── backend/                 # Spring Boot API (Java 21)
├── frontend/                # React SPA (Vite + TypeScript)
├── infrastructure/         # IaC
├── scripts/               # Utility scripts
├── docker-compose.yml     # Local development stack
├── init-db.sql           # Database initialization
└── README.md             # This file
```

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- **Node.js 20+** - https://nodejs.org/
- **Java 21 JDK** - https://adoptopenjdk.net/
- **Docker & Docker Compose** - https://www.docker.com/
- **Maven 3.9+** - https://maven.apache.org/

### Step-by-Step Setup

#### 1. Start Infrastructure (Docker Compose)

```bash
# Clone repository
git clone <repo-url>
cd opsmind

# Start all services
docker-compose up -d

# Wait for services to be healthy
docker-compose logs -f

# Verify (in another terminal)
docker-compose ps
```

Services available at:
- PostgreSQL: `localhost:5432` (postgres/postgres)
- Redis: `localhost:6379`
- Elasticsearch: `localhost:9200`
- Kafka UI: `localhost:8081`

#### 2. Start Backend (Spring Boot)

```bash
cd backend

# Build and run
mvn clean install
mvn spring-boot:run

# Verify - in another terminal
curl http://localhost:8080/actuator/health
```

Backend: `http://localhost:8080`

#### 3. Start Frontend (React)

```bash
cd frontend

# Install and run
npm install
npm run dev

# Opens at: http://localhost:5173
```

#### 4. Test Full Auth Flow

1. Open `http://localhost:5173` in browser
2. Click "Register"
3. Create account (any email/password)
4. Login with credentials
5. Redirected to dashboard ✅

### Stop All Services

```bash
docker-compose down
```

## 📚 Complete Documentation

- **[Architecture Overview](./docs/01-ARCHITECTURE.md)** - System design, principles, tech stack
- **[System Design](./docs/02-SYSTEM_DESIGN.md)** - Detailed component interactions
- **[Database Schema](./docs/03-DATABASE_SCHEMA.md)** - ER diagram & 18 table definitions
- **[API Reference](./docs/04-API_DESIGN.md)** - 50+ REST API endpoints
- **[Development Roadmap](./docs/10-DEVELOPMENT_ROADMAP.md)** - 10-phase implementation plan
- **[Backend Guide](./backend/README.md)** - Setup, testing, deployment
- **[Frontend Guide](./frontend/README.md)** - Setup, components, hooks, state management

## 🔄 Development Commands

```bash
# Frontend
cd frontend
npm run dev              # Development server
npm run build           # Production build  
npm run lint            # ESLint check
npm run format          # Prettier format
npm run test            # Run tests

# Backend
cd backend
mvn clean install       # Build
mvn spring-boot:run     # Development server
mvn test               # Tests
mvn verify             # Full verification

# Docker
docker-compose up -d    # Start services
docker-compose down     # Stop services
docker-compose logs -f  # View logs
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth with auto-refresh
- **RBAC** - Role-based access control (ADMIN, MANAGER, ANALYST, VIEWER)
- **Multi-tenancy** - Complete data isolation per organization
- **Row-Level Security** - Database-level isolation policies
- **Encrypted Passwords** - BCrypt with salt
- **CORS** - Properly configured cross-origin policies
- **Input Validation** - All API inputs validated
- **Audit Logging** - All user actions tracked

## 📊 Architecture

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│  Frontend   │◄────►│  API Gateway     │◄────►│  Kafka      │
│  (React 19) │       │ (Spring Boot 3)  │       │  Broker     │
└─────────────┘       └──────────────────┘       └─────────────┘
                            ▲
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
           ┌────────┐  ┌────────┐  ┌──────────┐
           │PostgreSQL│  │ Redis  │  │Elastic   │
           │Database │  │ Cache  │  │Search    │
           └────────┘  └────────┘  └──────────┘
```

## 🎯 Development Phases

### ✅ Completed
1. Project structure & documentation
2. Backend security infrastructure
3. Frontend React application scaffold
4. Docker Compose local environment
5. Database initialization

### 🔄 In Progress
6. User/Auth domain models & services
7. REST API endpoints implementation
8. Frontend UI components

### 📋 Upcoming
9. AI RCA service
10. Kubernetes deployment
11. CI/CD pipelines
12. Monitoring & observability
13. Production deployment

For detailed plan: [Development Roadmap](./docs/10-DEVELOPMENT_ROADMAP.md)

## 🆘 Troubleshooting

**Port already in use?**
```bash
# Find and kill process
lsof -i :5173  # Frontend
lsof -i :8080  # Backend
kill -9 <PID>
```

**Database connection error?**
```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U postgres -c "SELECT 1;"
```

**Frontend can't reach backend?**
```bash
# Verify backend is running
curl http://localhost:8080/actuator/health

# Check .env.local in frontend folder
# Should have: VITE_API_URL=http://localhost:8080/api
```

**Docker services won't start?**
```bash
# Check logs
docker-compose logs

# Restart Docker
docker-compose down -v
docker-compose up -d
```

## 📄 License

MIT License - See LICENSE file

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Implement changes with tests
3. Run linters and tests
4. Commit and push
5. Create Pull Request

## 📞 Support

- 📖 **Docs**: Check `docs/` and README files
- 🐛 **Issues**: GitHub Issues for bugs
- 💬 **Discussions**: GitHub Discussions for questions
- 📧 **Email**: yashwardhankumar15@gmail.com

---

**Version**: 1.0.0 (Development)  
**Last Updated**: 2024  
**Status**: Active Development ✨
