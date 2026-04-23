# API Configuration Migration Guide

## Overview

This guide explains how to remove hardcoded API URLs from your frontend components and use the centralized API configuration instead.

## Problem

Previously, components had hardcoded URLs like:

```javascript
const API_BASE = "http://process.env.REACT_APP_API_BASE_URL";
```

**Issue:** When using port forwarding or deploying to production, these hardcoded URLs don't work because they always try to connect to `process.env.REACT_APP_API_BASE_URL`.

## Solution

Use relative paths that work with any domain/port forwarding setup.

## Files Already Fixed ✅

- ✅ `src/AppointmentModal.js`
- ✅ `src/ChangePasswordModal.js`
- ✅ `src/Events.js`
- ✅ `src/ManageEventsPage.js`
- ✅ `src/PoojaItems.js`
- ✅ `src/login.js`
- ✅ `src/ForgotPassword.js`
- ✅ `src/YourBookings.js`
- ✅ `src/DashboardEventsDisplay.js`
- ✅ `src/PriestGallery.js`
- ✅ `src/config/apiConfig.js` - Now uses relative base URL

## Configuration Files

### `.env` (Development)

```env
REACT_APP_API_BASE_URL=
REACT_APP_ENVIRONMENT=development
REACT_APP_API_TIMEOUT=30000
```

**Empty URL means relative paths** - works with localhost AND port forwarding!

### `.env.production` (Production)

```env
REACT_APP_API_BASE_URL=https://api.priestfy.com
REACT_APP_ENVIRONMENT=production
REACT_APP_API_TIMEOUT=30000
```

## How to Fix Remaining Files

### Step 1: Add Import

```javascript
import { API_ENDPOINTS, buildApiUrl } from "./config/apiConfig";
```

### Step 2: Remove Hardcoded URL

Replace:

```javascript
const API_BASE = "http://process.env.REACT_APP_API_BASE_URL";
```

With the import above.

### Step 3: Replace API Calls

#### Using axios:

**Before:**

```javascript
const res = await axios.get(`${API_BASE}/api/events`);
```

**After:**

```javascript
const res = await axios.get(buildApiUrl(API_ENDPOINTS.EVENTS.GET_ALL));
```

#### Using fetch:

**Before:**

```javascript
const res = await fetch("http://process.env.REACT_APP_API_BASE_URL/api/auth/login", { ... });
```

**After:**

```javascript
const res = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), { ... });
```

#### For dynamic endpoints:

**Before:**

```javascript
fetch(`${API_BASE}/api/pooja-items/event/${eventId}`);
```

**After:**

```javascript
fetch(buildApiUrl(API_ENDPOINTS.POOJA_ITEMS.GET_BY_EVENT(eventId)));
```

## Available API Endpoints

All endpoints are defined in `src/config/apiConfig.js`:

### AUTH

- `API_ENDPOINTS.AUTH.LOGIN`
- `API_ENDPOINTS.AUTH.LOGOUT`
- `API_ENDPOINTS.AUTH.SIGNUP`
- `API_ENDPOINTS.AUTH.CHANGE_PASSWORD`
- `API_ENDPOINTS.AUTH.VALIDATE_EMAIL`
- etc.

### EVENTS

- `API_ENDPOINTS.EVENTS.GET_ALL`
- `API_ENDPOINTS.EVENTS.GET_BY_ID(id)`
- `API_ENDPOINTS.EVENTS.CREATE`
- `API_ENDPOINTS.EVENTS.UPDATE(id)`
- `API_ENDPOINTS.EVENTS.DELETE(id)`

### BOOKINGS

- `API_ENDPOINTS.BOOKINGS.GET_ALL`
- `API_ENDPOINTS.BOOKINGS.CREATE`
- etc.

### POOJA_ITEMS

- `API_ENDPOINTS.POOJA_ITEMS.GET_BY_EVENT(eventId)`
- `API_ENDPOINTS.POOJA_ITEMS.GET_ALL`
- etc.

### AVAILABILITY

- `API_ENDPOINTS.AVAILABILITY.GET(priestId, date)`
- etc.

### APPOINTMENTS

- `API_ENDPOINTS.APPOINTMENTS.GET_BY_PRIEST(priestId)`
- etc.

See `src/config/apiConfig.js` for the complete list.

## Files Still Needing Migration

The following files still have hardcoded URLs and should be migrated:

### High Priority

- `src/BookingModal.js`
- `src/PoojaStatsPage.js`
- `src/AskForMuhurtam.js`
- `src/admin/ManageAppointments.js`
- `src/admin/ManageCustomers.js`
- `src/admin/ManageDailyTimes.js`
- `src/admin/ManageEvents.js`
- `src/admin/ManageFestivals.js`
- `src/admin/ManageMuhurtamRequests.js`
- `src/admin/ManagePanchangam.js`
- `src/admin/ManagePoojaItems.js`
- `src/admin/ManagePoojaServices.js`
- `src/admin/ManagePrasadams.js`
- `src/admin/ManagePriests.js`

### Medium Priority

- `src/AvailabilityManager.js`
- `src/BookPriest.js`
- `src/Calendar.js`
- `src/CustomerNavbar.js`
- `src/Dashboard.js`
- `src/KnowledgeBase.js`
- `src/Mohurtam.js`
- `src/MuhurtamRequests.js`
- `src/Navbar.js`
- `src/PriestProfile.js`
- `src/Profile.js`
- `src/PrasadamPreparer.js`

## Testing Port Forwarding

### Before (would fail):

```bash
# Port forward: kubectl port-forward ... :8080
# Browser: http://localhost:3000
# ❌ Would try to fetch from process.env.REACT_APP_API_BASE_URL
```

### After (works everywhere):

```bash
# Port forward: kubectl port-forward ... :8080
# Browser: http://localhost:3000
# ✅ Works! Uses relative paths (browser's current domain)

# Or with custom domain:
# Browser: https://priestfy.example.com
# ✅ Works! Fetches from https://priestfy.example.com/api/...
```

## Environment Variables for Different Environments

### Development (localhost + port forwarding)

```env
REACT_APP_API_BASE_URL=
REACT_APP_ENVIRONMENT=development
```

### Staging

```env
REACT_APP_API_BASE_URL=https://api-staging.priestfy.com
REACT_APP_ENVIRONMENT=staging
```

### Production

```env
REACT_APP_API_BASE_URL=https://api.priestfy.com
REACT_APP_ENVIRONMENT=production
```

## How It Works

1. **Empty `REACT_APP_API_BASE_URL`** → Uses relative paths
   - `fetch("/api/events")` → Browser uses current domain
   - `http://localhost:3000` + `/api/events` = `http://localhost:3000/api/events`
   - With forwarding: `http://localhost:3000` forwards to backend → Works!

2. **Production URL set** → Uses absolute path
   - `fetch("https://api.priestfy.com/api/events")` → Direct connection

## Next Steps

1. ✅ Check that `.env` has empty `REACT_APP_API_BASE_URL`
2. 🔄 Test with port forwarding:
   ```bash
   kubectl port-forward service/backend 8080:8080 &
   npm start  # Frontend on localhost:3000
   # Should work! Forwarding proxies requests to backend
   ```
3. ✅ Migrate remaining files using the guide above
4. ✅ Update admin panel components in `src/admin/`
5. ✅ Test in production environment

## Quick Reference

**Always use:**

```javascript
import { API_ENDPOINTS, buildApiUrl } from "./config/apiConfig";

// For endpoints with params
buildApiUrl(API_ENDPOINTS.BOOKINGS.GET_BY_ID(id));

// For endpoints without params
buildApiUrl(API_ENDPOINTS.EVENTS.GET_ALL);
```

**Never use:**

```javascript
// ❌ AVOID
`${API_BASE}/api/events``http://process.env.REACT_APP_API_BASE_URL/api/events`;
```
