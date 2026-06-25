# OpsMind: Tab and Sub-tab Report

This report documents all navigation tabs and internal page sub-tabs.

## 1. Primary Navigation (Sidebar)
| Tab Name | Purpose | Working Status |
|---|---|---|
| **Dashboard** | Executive overview & KPIs | **FULLY WORKING** |
| **Incidents** | Workflow for incident triage | **FULLY WORKING** |
| **Alert Stream** | Real-time telemetry signals | **FULLY WORKING** |
| **AI SRE Copilot** | LLM-backed operational assistant | **PARTIALLY WORKING** (Static simulation in some areas) |
| **Predictive Insights** | Future risk modeling | **UI ONLY / STUBBED** |
| **Analytics** | Performance and SLO modeling | **FULLY WORKING** |
| **Infrastructure** | Resource inventory management | **FULLY WORKING** |
| **Security Scan** | Compliance finding tracking | **FULLY WORKING** |
| **Integrations** | External tool configurations | **UI ONLY / STUBBED** |
| **Settings** | User and Org configuration | **FULLY WORKING** |

## 2. Internal Sub-tabs
### Incidents Page (Triage HUD)
| Tab Name | Purpose | Status | API Connected? | Data Source |
|---|---|---|---|---|
| **ALL** | Unified list of all incidents | Working | Yes | `/api/incidents` |
| **OPEN** | New, unacknowledged issues | Working | Yes | `/api/incidents` (Filter) |
| **INVESTIGATING** | Issues currently being triaged | Working | Yes | `/api/incidents` (Filter) |
| **IDENTIFIED** | Root cause identified | Working | Yes | `/api/incidents` (Filter) |
| **MITIGATING** | Active recovery underway | Working | Yes | `/api/incidents` (Filter) |
| **RESOLVED** | Historical incident log | Working | Yes | `/api/incidents` (Filter) |

### Demo Controller (Showcase Widget)
| Sub-tab Name | Purpose | Status | Working? |
|---|---|---|---|
| **Walkthrough** | Step-by-step product tour | Fully UI | Yes |
| **Scenario Lab** | Injecting failures for demo | API Trigger | Yes (Simulator API) |

## 3. Missing Features
- **Alert Stream Filters**: Currently has a local search bar but no multi-select filters for severity/source.
- **Analytics Date Range**: Tabs for (1H, 24H, 7D) are missing in many detail views.
- **Integration Configuration**: Clicking a sub-tab (e.g., Slack) currently only opens a placeholder or "Coming Soon".
