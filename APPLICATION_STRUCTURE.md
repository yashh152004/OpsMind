# OpsMind: Application Structure Audit

## 1. Page Hierarchy
The application is structured as a Single Page Application (SPA) using React Router.

### Public Routes
- **Login Page (`/login`)**: Authentication gateway.
- **Register Page (`/register`)**: User account creation.
- **Setup Wizard (`/onboarding`)**: Initial organization and cluster configuration.

### Protected Routes (Inside `AppLayout`)
- **Dashboard (`/dashboard`)**: Executive overview and real-time KPI matrix.
- **Incidents (`/incidents`)**: Incident management, triage, and declaration.
- **Alert Stream (`/alerts`)**: Live telemetry and signal processing.
- **AI SRE Copilot (`/ai-chat`)**: Interactive AI agent for operational reasoning.
- **Predictive Insights (`/ai-insights`)**: AI-driven failure prediction and health analysis.
- **Analytics (`/analytics`)**: Long-term performance trends and SLO modeling.
- **Infrastructure (`/infrastructure`)**: Inventory of production nodes and cloud resources.
- **Security Scan (`/security`)**: Compliance findings and security posture.
- **Integrations (`/integrations`)**: External service connections (Slack, PagerDuty, etc.).
- **Settings (`/settings`)**: Console configuration and identity management.

## 2. Navigation Menus
### Sidebar (Global Navigation)
- **Operational Group**
    - Dashboard
    - Incidents
    - Alert Stream
- **Intelligence Group**
    - AI SRE Copilot
    - Predictive Insights
    - Analytics
- **System Group**
    - Infrastructure
    - Security Scan
    - Integrations
    - Settings

## 3. Global Components
- **Header**: Contains Global Search, Real-time Notification Center, AI Status Index, and User Profile.
- **Sidebar**: Collapsible navigation with brand header and workspace status.
- **Toaster**: Bottom-right notification toast system.
- **Demo Controller**: Persistent "Enterprise Showcase" widget for product walkthroughs and scenario injection.

## 4. UI Elements per Page
### Dashboard
- **HUD Header**: Page title and Connectivity status.
- **KPI Matrix**: 4 Metric cards (Uptime, Active Incidents, Latency, SLA).
- **Performance Graph**: AreaChart for Infrastructure Health Trend.
- **Severity Distribution**: BarChart for Incident Severity categories.
- **Intelligence Table**: AI Reasoning table with severity, context, confidence, and logic state.

### Incidents Page
- **Triage HUD**: Page header with export/declare buttons.
- **Status Tabs**: (ALL, OPEN, INVESTIGATING, IDENTIFIED, MITIGATING, RESOLVED).
- **Search/Filter Bar**: Local search for incidents.
- **Incident Table**: List with reference IDs, context, severity, status, service, and detected time.
- **Declaration Modal**: Form for title, severity, service, and description.

### Alert Stream
- **Signal Header**: Page header with export/acknowledge-all buttons.
- **Filter Strip**: Local search for alerts.
- **Signal Table**: Criticality, Summary, Condition/Insights, and Timestamp.

### Infrastructure Page
- **Inventory Header**: Page header with topology/scan buttons.
- **Resource Matrix**: KPI cards for Assets, Availability, Unhealthy Nodes, and Connectivity.
- **Asset Table**: Resource identity, type, cluster/region, health metric (bar), and state.

## 5. Modals & Drawers
- **Declare Incident Modal**: In `IncidentsPage.tsx`.
- **Notification Drawer**: In `Header.tsx`.
- **Search Drawer**: (If global search is active) In `Header.tsx`.

## 6. Feedback & Notifications
- **Toast Notifications**: Used for success/error feedback on actions (acknowledge, resolve, login).
- **Notification Center**: Persistent bell icon with unread count in header.
