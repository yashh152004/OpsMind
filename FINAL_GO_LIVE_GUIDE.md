# FINAL_GO_LIVE_GUIDE.md

## 🏁 OpsMind Readiness Checklist

### 1. Prerequisite Environment
1. **Java**: Version 21 (Spring Boot 3.5).
2. **Python**: Version 3.10+ (AI Engine).
3. **Database**: MySQL 8.x configured in `application.yml`.

### 2. Startup Sequence
**Step A: Launch AI Engine**
```powershell
cd ai-engine
python main.py
```

**Step B: Launch Core Backend**
```powershell
cd backend
mvn clean spring-boot:run
```

**Step C: Launch Frontend**
```powershell
cd frontend
npm run dev
```

### 3. Demo Credentials
- **Username**: `admin@opsmind.io`
- **Password**: `OpsMind2026!`
- **Role**: SRE_ADMIN

### 4. Recruiter Talk Track
- "OpsMind uses a distributed architecture to separate telemetry storage from semantic reasoning."
- "The AI engine is a specialized Python microservice that classifies intent before retrieving contextual data."
- "Even if the AI service goes offline, the platform is resilient and falls back to a deterministic Java reasoning engine."
