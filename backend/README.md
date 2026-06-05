# OpsMind Backend - Spring Boot 3 Application

Production-grade backend for the AI-powered observability platform.

## Technology Stack

- **Java 21** (LTS)
- **Spring Boot 3.3.0**
- **Spring Security** with JWT
- **PostgreSQL 15**
- **Redis 7**
- **Elasticsearch 8**
- **Apache Kafka 3**
- **Maven 3.9+**

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/opsmind/
│   │   │   ├── core/
│   │   │   │   ├── OpsMindApplication.java
│   │   │   │   ├── adapter/           # HTTP Controllers, Persistence
│   │   │   │   ├── application/       # Business Services
│   │   │   │   ├── domain/            # Domain Models & Logic
│   │   │   │   └── infrastructure/    # Config, Exceptions, Security
│   │   │   │
│   │   │   ├── incident/              # Incident Management Module
│   │   │   ├── alert/                 # Alert Management Module
│   │   │   ├── log/                   # Log Analytics Module
│   │   │   ├── user/                  # User Management Module
│   │   │   ├── auth/                  # Authentication Module
│   │   │   └── ai/                    # AI Integration Module
│   │   │
│   │   └── resources/
│   │       ├── application.yml        # Main configuration
│   │       ├── application-dev.yml    # Development config
│   │       ├── application-prod.yml   # Production config
│   │       └── db/changelog/          # Liquibase migrations
│   │
│   └── test/
│       └── java/com/opsmind/          # Unit & Integration Tests
│
├── pom.xml                             # Maven Configuration
├── Dockerfile                          # Docker build
└── README.md

```

## Architecture Layers

### 1. Adapter (Presentation)
- **Controllers**: REST API endpoints
- **DTOs**: Data Transfer Objects
- **Mappers**: Entity ↔ DTO mapping

### 2. Application (Use Cases)
- **Services**: Business logic orchestration
- **QueryServices**: Complex data retrieval
- **EventPublishers**: Event publishing

### 3. Domain (Business Rules)
- **Entities**: Core business objects
- **ValueObjects**: Immutable value types
- **Repositories**: Domain persistence interfaces
- **Factories**: Object creation logic

### 4. Infrastructure (Technical Details)
- **Config**: Spring configuration beans
- **Security**: JWT, RBAC, authorization
- **Exceptions**: Exception handling
- **Adapters**: External service integrations

## Quick Start

### Prerequisites

- Java 21 (JDK)
- Maven 3.9+
- Docker & Docker Compose
- Git

### Local Development Setup

1. **Clone the repository**
```bash
cd backend
```

2. **Start infrastructure (Docker Compose)**
```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Elasticsearch (port 9200)
- Kafka (port 9092)
- Zookeeper (port 2181)

3. **Configure environment**
```bash
# Create .env file
cp .env.example .env

# Edit as needed
export JWT_SECRET="your-secret-key-change-in-production"
export DB_PASSWORD="postgres"
```

4. **Build the project**
```bash
mvn clean build
```

5. **Run the application**
```bash
mvn spring-boot:run

# Or
java -jar target/opsmind-backend-1.0.0.jar
```

Application starts at: `http://localhost:8080/api`
API Documentation: `http://localhost:8080/api/swagger-ui.html`

## API Endpoints

### Health Check
```bash
curl http://localhost:8080/actuator/health
```

### API Documentation
```
Swagger UI: http://localhost:8080/api/swagger-ui.html
OpenAPI JSON: http://localhost:8080/api/v3/api-docs
```

### Authentication
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'

# Response includes:
# {
#   "data": {
#     "accessToken": "eyJhbGc...",
#     "refreshToken": "eyJyZW...",
#     "expiresIn": 900
#   }
# }
```

### Using Access Token
```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer {accessToken}"
```

## Testing

### Run All Tests
```bash
mvn test
```

### Run Specific Test Class
```bash
mvn test -Dtest=AuthServiceTest
```

### Run with Coverage
```bash
mvn test jacoco:report

# View coverage report
open target/site/jacoco/index.html
```

## Database Migrations

### Liquibase Setup
- Location: `src/main/resources/db/changelog/`
- Format: YAML/XML changelogs
- Automatic on startup

### Create Migration
```bash
liquibase generateChangeLog
```

### Rollback
```bash
liquibase rollback 10
```

## Configuration

### Application Properties

**development** (`application-dev.yml`):
- Debug logging
- JPA SQL logging
- Hot reload
- CORS: http://localhost:3000

**production** (`application-prod.yml`):
- Info logging only
- Database replication
- Connection pooling
- HTTPS required

### Environment Variables

```bash
# Spring Profile
SPRING_PROFILES_ACTIVE=prod

# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/opsmind
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=secure_password

# JWT
JWT_SECRET=your-secret-key-min-256-bits

# Redis
SPRING_REDIS_HOST=redis
SPRING_REDIS_PORT=6379

# Kafka
SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:9092

# Elasticsearch
ELASTICSEARCH_HOST=elasticsearch
ELASTICSEARCH_PORT=9200

# AWS
AWS_S3_BUCKET=opsmind-files
AWS_REGION=us-east-1
```

## Build & Deployment

### Build Docker Image
```bash
docker build -t opsmind-backend:1.0.0 .
```

### Push to Registry
```bash
docker tag opsmind-backend:1.0.0 your-registry/opsmind-backend:1.0.0
docker push your-registry/opsmind-backend:1.0.0
```

### Run Container
```bash
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/opsmind \
  -e JWT_SECRET=your-secret \
  opsmind-backend:1.0.0
```

## Development Workflow

### Create New Feature

1. **Create Domain Model**
```bash
touch src/main/java/com/opsmind/feature/domain/Feature.java
```

2. **Create Repository Interface**
```bash
touch src/main/java/com/opsmind/feature/domain/FeatureRepository.java
```

3. **Create Service Layer**
```bash
touch src/main/java/com/opsmind/feature/application/FeatureService.java
```

4. **Create Controller**
```bash
touch src/main/java/com/opsmind/feature/adapter/controller/FeatureController.java
```

5. **Create DTO**
```bash
touch src/main/java/com/opsmind/feature/adapter/controller/FeatureDTO.java
```

6. **Create Tests**
```bash
touch src/test/java/com/opsmind/feature/application/FeatureServiceTest.java
```

### Code Standards

- Follow [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Use Lombok for boilerplate
- Document public APIs with JavaDoc
- Write unit tests (min 80% coverage)
- Use meaningful exception messages

## Monitoring & Observability

### Metrics Endpoint
```bash
curl http://localhost:8080/actuator/metrics
```

### Health Status
```bash
curl http://localhost:8080/actuator/health/readiness
```

### Application Logs
```bash
tail -f logs/application.log

# Docker logs
docker logs opsmind-backend
```

### Performance Profiling
```bash
# Enable JFR
java -XX:StartFlightRecording=duration=60s,filename=myrecording.jfr \
  -jar target/opsmind-backend-1.0.0.jar
```

## Troubleshooting

### Port Already in Use
```bash
# Find process on port 8080
lsof -i :8080

# Kill process
kill -9 <PID>
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Verify credentials in application.yml
# Default: user=postgres, pass=postgres
```

### JWT Token Expired
- Access tokens: 15 minutes (900,000 ms)
- Refresh tokens: 7 days
- Use refresh endpoint to get new access token

### Elasticsearch Connection Issues
```bash
# Check Elasticsearch status
curl http://localhost:9200/_cluster/health

# View indices
curl http://localhost:9200/_cat/indices
```

## Performance Tuning

### Database Connection Pool
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
```

### JVM Heap
```bash
java -Xmx2G -Xms1G -jar target/opsmind-backend-1.0.0.jar
```

### Kafka Consumer Groups
```bash
# List consumer groups
kafka-consumer-groups --bootstrap-server localhost:9092 --list

# Describe consumer group
kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group opsmind-service --describe
```

## Security

### Vulnerability Scanning
```bash
mvn org.owasp:dependency-check-maven:check
```

### SAST Analysis
```bash
mvn spotbugs:check
```

### Dependency Audit
```bash
mvn dependency:check
```

## CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/build.yml
name: Build Backend
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up JDK 21
        uses: actions/setup-java@v2
        with:
          java-version: '21'
      - name: Build with Maven
        run: mvn clean install
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Support

- 📖 [API Documentation](http://localhost:8080/api/swagger-ui.html)
- 🐛 [Bug Reports](https://github.com/opsmind/backend/issues)
- 💬 [Discussions](https://github.com/opsmind/backend/discussions)

## License

MIT License - See LICENSE file

---

**Last Updated**: June 2026
**Version**: 1.0.0
**Maintainers**: OpsMind Engineering Team
