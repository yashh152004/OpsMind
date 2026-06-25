# OpsMind: Button Inventory

Detailed inventory of interactive buttons across the application.

## 1. Global Buttons
| Button Name | Location | Expected Function | Current Status | Backend Endpoint |
|---|---|---|---|---|
| **Notification Bell** | Header | Open notification drawer | Working | `/api/notifications` |
| **User Profile** | Header | Open profile dropdown | Partially Working | - |
| **Enterprise Showcase** | Fixed Bottom-Right | Toggle demo control panel | Working | - |
| **Walkthrough Steps** | Demo Controller | Link to specific pages | Working | Frontend router |
| **Scenario Triggers** | Demo Controller | Inject simulation event | Working | `/api/simulator/trigger` |

## 2. Dashboard Buttons
| Button Name | Location | Expected Function | Current Status | Backend Endpoint |
|---|---|---|---|---|
| **Export Report** | HUD Header | Download metrics summary | Working | Frontend export helper |
| **Add Widget** | HUD Header | Customize dashboard | UI ONLY | - |
| **Time Range (1H-7D)** | Graph Card | Filter trend data | UI ONLY (Static) | - |
| **View Logic State** | Intelligence Table | Open AI reasoning details | UI ONLY | - |

## 3. Incidents Page
| Button Name | Location | Expected Function | Current Status | Backend Endpoint |
|---|---|---|---|---|
| **Declare Incident** | HUD Header | Open creation modal | Working | - |
| **Export Data** | HUD Header | Download table as CSV | Working | Frontend export helper |
| **Triage Tabs** | Filter HUD | Filter list by status | Working | Frontend state filter |
| **AI Analysis** | Table Row | Chat with AI about incident | Working | Frontend router |
| **Resolve** | Table Row | Close the incident | Working | `/api/incidents/{id}/resolve` |
| **Confirm Declaration** | Modal | Submit new incident | Working | `/api/incidents` |

## 4. Alert Stream
| Button Name | Location | Expected Function | Current Status | Backend Endpoint |
|---|---|---|---|---|
| **Export CSV** | HUD Header | Download alert log | Working | Frontend export helper |
| **Acknowledge All** | HUD Header | Clear all alerts | BROKEN (No API) | - |
| **AI Analysis** | Table Row | Chat with AI about alert | Working | Frontend router |
| **Acknowledge** | Table Row | Clear specific alert | Working | `/api/alerts/{id}/acknowledge` |

## 5. Infrastructure Page
| Button Name | Location | Expected Function | Current Status | Backend Endpoint |
|---|---|---|---|---|
| **Topology View** | HUD Header | Show visual node map | UI ONLY | - |
| **Inventory Scan** | HUD Header | Refresh asset list | UI ONLY | - |
| **Node Monitoring** | Table Row | Open detailed node HUD | UI ONLY | - |

## 6. Security Page
| Button Name | Location | Expected Function | Current Status | Backend Endpoint |
|---|---|---|---|---|
| **Export Findings** | HUD Header | Download report | Working | Frontend export helper |
| **Perform Scan** | HUD Header | Trigger real-time scan | UI ONLY | - |
| **Remediate** | Table Row | Trigger automated fix | UI ONLY | - |
