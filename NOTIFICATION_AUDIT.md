# OpsMind: Notification Audit

Real-time feedback and event alerting analysis.

## 1. Notification Center (Bell Icon)
- **Component**: `Header.tsx`
- **Logic**: Fetches from `/api/notifications`.
- **Status**: **PARTIALLY WORKING**
- **Features**:
    - Unread count badge.
    - Droplist of recent events.
    - Severity labeling (Critical, Info, Warning).
- **Issues**:
    - "Mark All as Read" button does not have a backend implementation.
    - No direct link to the incident/alert referenced in the notification.

## 2. In-App Toasts
- **Library**: `sonner`
- **Status**: **FULLY WORKING**
- **Triggers**:
    - Alert detected in the stream.
    - Action success (Incident Created, Acknowledged).
    - Session timeout/Error.

## 3. Unread Management
- **Persistence**: Read status is tracked in the database (`notification.read`).
- **Sync**: Header fetches notifications on mount and periodic interval.

## 4. Missing Features
- **Browser Push Notifications**: No support for background notifications.
- **Webhook Subscriptions**: No UI to configure where notifications should be routed (Slack, etc.).
- **User Preference Center**: User cannot toggle which types of notifications they want to receive.
- **Sound Alerts**: No audible alerts for P1 Critical incidents.
- **Notification Aggregation**: High-volume alerts cause notification spam rather than grouped updates.
