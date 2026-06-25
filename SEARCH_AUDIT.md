# OpsMind: Search Audit

Analysis of discovery mechanisms throughout the platform.

## 1. Global Search
- **Component**: `Header.tsx` (CMD+K Trigger)
- **Status**: **PARTIALLY WORKING**
- **Issues**:
    - Opens the search dialog correctly.
    - Result list is currently static or returns a limited mock set from `/api/search/global`.
    - Lacks "Deep Link" capabilities to navigate directly to an incident or alert from the search bar.

## 2. Table Search (Local)
### Incidents Table
- **Type**: Frontend Filter on cached data.
- **Status**: **FULLY WORKING**
- **Features**: Search by ID, Title, or Service name.
- **Broken**: Multi-column search (e.g., searching "P1 Database" doesn't yield results unless both terms are in one field).

### Alert Stream Table
- **Type**: Frontend Filter.
- **Status**: **FULLY WORKING**
- **Features**: Search by source or alert name.

## 3. Filter Mechanisms
- **Incidents Status**: Fully working via status tabs.
- **Alert Filtering**: Basic search available, but categorical filtering (by Severity or Cloud Provider) is missing.
- **Asset Filtering**: Table search works, but a "Filter by Cloud" (AWS/GCP) toggle is missing.

## 4. Missing Search Features
- **Filter Persistency**: Search terms and active tabs are lost upon navigating away and back.
- **Audit Log Search**: No historical search for administrative actions.
- **AI-Powered Search**: Natural language search (e.g., "Show me P1s from last Tuesday") is not integrated into the Global Search bar.
