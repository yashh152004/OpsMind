# OpsMind - AI-Powered Observability & Incident Intelligence Platform

**Production-Grade Full-Stack SaaS Platform**

![Status](https://img.shields.io/badge/Status-Production--Ready-green)
![Java](https://img.shields.io/badge/Java-21-orange)
![Spring%20Boot](https://img.shields.io/badge/Spring%20Boot-3.3-green)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue)

## 🎯 Overview

OpsMind is an enterprise-grade observability platform that helps teams:

- **Centralize** incident management across all services
- **Analyze** logs and metrics with AI-powered insights
- **Reduce** Mean Time To Resolution (MTTR)
- **Correlate** alerts intelligently
- **Generate** actionable root cause analysis

## 🏗️ Architecture

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Java 21 + Spring Boot 3 + Clean Architecture
- **Database**: PostgreSQL + Elasticsearch + Redis
- **Message Queue**: Apache Kafka
- **AI/ML**: Python + LangChain + OpenAI/Claude
- **Cloud**: AWS (EKS, RDS, S3, CloudFront)
- **DevOps**: Docker, Kubernetes, Helm, GitHub Actions

## 📁 Project Structure

```
OpsMind/
├── frontend/                 # React SaaS UI
├── backend/                  # Spring Boot API
├── ai-service/              # Python AI Engine
├── infrastructure/          # Kubernetes & Terraform
├── docs/                    # Architecture & Design
├── scripts/                 # Utilities & Automation
└── .github/workflows/       # CI/CD Pipelines
```

## 🚀 Quick Start

### Prerequisites
- Java 21
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Python 3.11+

### Local Development

```bash
# Start infrastructure
docker-compose up -d

# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm run dev

# AI Service
cd ai-service
pip install -r requirements.txt
python main.py
```

## 📚 Documentation

- [Architecture Overview](docs/01-ARCHITECTURE.md)
- [System Design](docs/02-SYSTEM_DESIGN.md)
- [Database Schema](docs/03-DATABASE_SCHEMA.md)
- [API Design](docs/04-API_DESIGN.md)
- [Development Roadmap](docs/10-DEVELOPMENT_ROADMAP.md)

## 🔐 Security

- JWT Authentication with Refresh Tokens
- Role-Based Access Control (RBAC)
- Multi-Tenant Data Isolation
- End-to-End Encryption
- Rate Limiting & CORS
- Input Validation & Sanitization
- Audit Logging

## 🎨 Features

### Incident Management
- Create, assign, and resolve incidents
- Real-time incident tracking
- Timeline and comment threads
- Severity-based escalation

### Log Analytics
- Centralized log ingestion
- Full-text search
- Pattern detection
- Error grouping

### Real-Time Monitoring
- CPU, Memory, Disk, Network monitoring
- Error rate tracking
- API latency metrics
- Throughput analysis

### AI-Powered Intelligence
- Root cause analysis
- Log pattern recognition
- Incident summarization
- Alert correlation
- Engineering assistant chat

## 📊 Analytics & Reporting
- MTTR & MTBF metrics
- Incident trends
- Reliability scores
- Service health dashboards

## 🔗 Multi-Tenant SaaS

OpsMind supports multiple organizations with complete data isolation:
- Separate user management per org
- Team-based access control
- Org-specific configurations
- Usage tracking & billing

## 📈 Technology Highlights

### Clean Architecture
- Separation of concerns
- Domain-Driven Design
- SOLID Principles
- Easy testing & maintenance

### Scalability
- Horizontal scaling via Kubernetes
- Distributed caching with Redis
- Event streaming with Kafka
- Database replication

### Developer Experience
- Hot reload in development
- Comprehensive logging
- Error tracking
- Performance monitoring

## 🤝 Contributing

This is a reference implementation demonstrating enterprise SaaS architecture.

## 📄 License

MIT License - See LICENSE file

## 👥 Team

Built by an elite engineering team:
- Staff Software Architect
- Senior Full Stack Engineers
- Senior Spring Boot Engineer
- Senior React Engineer
- Senior DevOps Engineer
- Cloud Architect
- AI/ML Engineer
- Database Architect
- SRE Engineer

---

**Last Updated**: June 2026
**Version**: 1.0.0
**Status**: Production Ready
