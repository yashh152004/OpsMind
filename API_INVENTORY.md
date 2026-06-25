# OpsMind: API Inventory

This inventory documents all backend endpoints observed in `api.ts`.

## 🚨 Authentication Endpoints
| Endpoint | Method | Consumer | Working Status |
|---|---|---|---|
| `/auth/register` | `POST` | `RegisterPage.tsx` | Working |
| `/auth/login` | `POST` | `LoginPage.tsx` | Working |
| `/auth/logout` | `POST` | `Sidebar.tsx` | Working |
| `/auth/refresh` | `POST` | `api.ts` Interceptor | Technical Layer |
| `/auth/verify/{token}` | `POST` | Setup Wizard | Working |
| `/auth/forgot-password` | `POST` | - | Backend Only |
| `/auth/reset-password/{token}` | `POST` | - | Backend Only |

## 📁 Organization & Management
| Endpoint | Method | Consumer | Working Status |
|---|---|---|---|
| `/organizations` | `GET` | Setup Wizard | Working |
| `/organizations/{id}` | `GET` | Setup Wizard | Working |
| `/organizations` | `POST` | Setup Wizard | Working |
| `/users/me` | `GET` | `hooks/useAuth.ts` | Working |
| `/users` | `GET` | - | Admin Context |
| `/users` | `POST` | - | Admin Context |

## 💥 Incident Management
| Endpoint | Method | Consumer | Working Status |
|---|---|---|---|
| `/incidents` | `GET` | `IncidentsPage.tsx` | Working |
| `/incidents` | `POST` | `IncidentsPage.tsx` | Working |
| `/incidents/{id}/assign` | `POST` | - | Partially Working |
| `/incidents/{id}/escalate` | `POST` | - | Backend Only |
| `/incidents/{id}/resolve` | `POST` | `IncidentsPage.tsx` | Working |

## 📡 Signal & Telemetry
| Endpoint | Method | Consumer | Working Status |
|---|---|---|---|
| `/alerts` | `GET` | `AlertsPage.tsx` | Working |
| `/alerts/{id}/acknowledge` | `POST` | `AlertsPage.tsx` | Working |
| `/alerts/{id}/resolve` | `POST` | - | Backend Only |

## 📊 Analytics & Reporting
| Endpoint | Method | Consumer | Working Status |
|---|---|---|---|
| `/summary/stats` | `GET` | `DashboardPage.tsx` | Working |
| `/analytics/trends` | `GET` | `AnalyticsPage.tsx` | Working |
| `/infrastructure/assets` | `GET` | `InfrastructurePage.tsx` | Working |
| `/security/findings` | `GET` | `SecurityPage.tsx` | Working |

## 🤖 AI & Simulator
| Endpoint | Method | Consumer | Working Status |
|---|---|---|---|
| `/ai/chat` | `POST` | `AiChatPage.tsx` | Working |
| `/ai/insights` | `GET` | `AiInsightsPage.tsx` | Working |
| `/simulator/trigger` | `POST` | `DemoController.tsx` | Working |

## ⚠️ Issues Found
- **Missing `/notifications/all/read`**: Bulk notification acknowledgement not implemented.
- **Acknowledge All Alerts**: Missing endpoint for bulk alert acknowledgement.
- **Real-time Engine**: Currently relies on HTTP Polling (10s-15s) rather than a persistent WebSocket/SSE connection for all pages.
