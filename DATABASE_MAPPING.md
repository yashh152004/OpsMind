# OpsMind: Database Mapping

Flow from UI to Persistence.

## 1. Incident Lifecycle
**UI Component**: `IncidentsPage.tsx` (Table & Modal)
**↓ API**: `POST /api/incidents` | `GET /api/incidents`
**↓ Service**: `IncidentService.java`
**↓ Model**: `Incident.java`
**↓ Database Table**: `incidents`
- **Keys**: `id`, `title`, `severity`, `status`, `service_name`, `organization_id`, `created_at`.

## 2. Telemetry Signal Stream
**UI Component**: `AlertsPage.tsx` (Signal Table)
**↓ API**: `GET /api/alerts` | `POST /api/alerts/{id}/acknowledge`
**↓ Service**: `AlertService.java`
**↓ Model**: `Alert.java`
**↓ Database Table**: `alerts`
- **Keys**: `id`, `alert_name`, `status`, `source`, `message`, `timestamp`, `organization_id`.

## 3. Organizational Identity
**UI Component**: `SetupWizard.tsx` | `LoginPage.tsx`
**↓ API**: `POST /api/auth/login` | `POST /api/organizations`
**↓ Service**: `AuthService.java` | `OrganizationService.java`
**↓ Model**: `User.java` | `Organization.java`
**↓ Database Table**: `users`, `organizations`
- **Relation**: `User` belongs to `Organization` via `organization_id`.

## 4. Infrastructure Assets
**UI Component**: `InfrastructurePage.tsx` (Asset Table)
**↓ API**: `GET /api/infrastructure/assets`
**↓ Service**: `InfrastructureService.java` (Likely mock-heavy initially)
**↓ Model**: `InfrastructureAsset.java`
**↓ Database Table**: `infrastructure_assets`
- **Keys**: `id`, `name`, `type`, `provider`, `region`, `health_score`.

## 5. Security Posture
**UI Component**: `SecurityPage.tsx` (Findings Stream)
**↓ API**: `GET /api/security/findings`
**↓ Service**: `SecurityService.java`
**↓ Model**: `SecurityFinding.java`
**↓ Database Table**: `security_findings`
- **Keys**: `id`, `severity`, `category`, `resource`, `status`.
