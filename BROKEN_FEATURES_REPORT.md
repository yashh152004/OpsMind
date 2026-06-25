# OpsMind: Broken Features & Technical Debt Report

This report identifies critical blockers and non-functional components identified during the audit.

## 1. Non-Functional Logic (Dead Buttons/Links)
- **Alert Stream**: "Acknowledge All" button. (Backend endpoint missing).
- **Settings**: "Audit Logs" link in User Profile. (No UI or API).
- **Settings**: "Change Key" link. (Opens no dialog).
- **Incident List**: "View Details" (ExternalLink icon). (Currently does nothing on click).
- **Infrastructure**: "Topology View" and "Inventory Scan" buttons. (Placeholders).
- **Security**: "Remediate" button for security findings. (No backend handler).

## 2. API & Data Blockers
- **Notification Management**: `POST /api/notifications/all/read` does not exist. The UI "Mark All as Read" remains non-functional.
- **Bulk Operations**: No support for bulk incident assignment or bulk alert resolution.
- **Empty States**: If the `SummaryStats` API fails, the Dashboard graph renders an empty area chart without a "Data Unavailable" notice.

## 3. UI/UX Debt
- **Search Resiliency**: The "Global Search" in the header returns "No Results" even for exact name matches because the backend regex is overly strict.
- **Mobile Responsive**: The "Demo Controller" widget overlaps critical UI on smaller screens (below 768px).
- **Filter Reset**: Status tabs on the Incident page are reset whenever the query parameter changes or on manual refresh.

## 4. Stability Concerns
- **Polling Noise**: The 10s-15s polling frequency on all pages adds significant load to the JVM heap. Consider transitioning core UI (Alerts/Notifications) to SSE (Server-Sent Events).
- **Mock Data Reliance**: Some intelligence reasoning rows are hardcoded as fallback data in the frontend rather than being strictly API-driven.

## 5. Security Findings
- **API Key Reveal**: The Settings page "Reveal Key" button works, but there is no "Re-hide" logic or session timeout for visible secrets.
