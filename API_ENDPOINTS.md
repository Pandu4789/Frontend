# PRIESTFY Frontend - API Endpoints Directory

This document provides a comprehensive list of all API endpoints used throughout the PRIESTFY frontend application, organized by feature/domain.

---

## 📋 Authentication & User Management

### `/api/auth/login`

- **Method:** POST
- **Files:** [login.js](src/login.js), [ForgotPassword.js](src/ForgotPassword.js)
- **Description:** User login endpoint

### `/api/auth/logout`

- **Method:** POST
- **Files:** [apiConfig.js](src/config/apiConfig.js)
- **Description:** User logout endpoint

### `/api/auth/signup`

- **Method:** POST
- **Files:** [SignUp.js](src/SignUp.js), [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** User registration endpoint

### `/api/auth/validate-email`

- **Method:** POST
- **Files:** [ForgotPassword.js](src/ForgotPassword.js)
- **Description:** Validate email existence

### `/api/auth/forgot-password`

- **Method:** POST
- **Files:** [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Initiate password reset flow

### `/api/auth/reset-password`

- **Method:** POST
- **Files:** [ForgotPassword.js](src/ForgotPassword.js), [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Complete password reset with token

### `/api/auth/change-password`

- **Method:** POST
- **Files:** [ChangePasswordModal.js](src/ChangePasswordModal.js), [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Change password for authenticated users

### `/api/auth/priests`

- **Method:** GET
- **Files:** [ManagePriests.js](src/admin/ManagePriests.js), [BookPriest.js](src/BookPriest.js), [PriestProfile.js](src/PriestProfile.js), [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Get all priests

### `/api/auth/priests/{id}`

- **Method:** GET, PUT, DELETE
- **Files:** [ManagePriests.js](src/admin/ManagePriests.js), [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Get, update, or delete a specific priest

### `/api/auth/register-priest`

- **Method:** POST
- **Files:** [ManagePriests.js](src/admin/ManagePriests.js)
- **Description:** Admin: Register a new priest

### `/api/auth/customers`

- **Method:** GET
- **Files:** [ManageCustomers.js](src/admin/ManageCustomers.js)
- **Description:** Get all customers (admin only)

### `/api/auth/customers/{id}`

- **Method:** GET, PUT, DELETE
- **Files:** [ManageCustomers.js](src/admin/ManageCustomers.js)
- **Description:** Get, update, or delete a specific customer

### `/api/auth/register-customer`

- **Method:** POST
- **Files:** [ManageCustomers.js](src/admin/ManageCustomers.js)
- **Description:** Admin: Register a new customer

---

## 👤 Profile & User Information

### `/api/profile`

- **Method:** GET, PUT
- **Files:** [Profile.js](src/Profile.js), [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Get or update current user profile

### `/api/profile?email={email}`

- **Method:** GET
- **Files:** [Profile.js](src/Profile.js), [PriestProfile.js](src/PriestProfile.js), [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Get profile by email address

### `/api/profile/updateProfilePicture`

- **Method:** POST
- **Files:** [Profile.js](src/Profile.js)
- **Description:** Upload and update profile picture

### `/api/profile/update`

- **Method:** POST
- **Files:** [Profile.js](src/Profile.js)
- **Description:** Update profile information

### `/api/users`

- **Method:** GET, PUT
- **Files:** [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Get or update user information

---

## 📅 Appointments & Availability

### `/api/appointments`

- **Method:** GET, POST
- **Files:** [Calendar.js](src/Calendar.js), [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Get all appointments or create new appointment

### `/api/appointments/priest/{priestId}`

- **Method:** GET
- **Files:** [Calendar.js](src/Calendar.js), [Dashboard.js](src/Dashboard.js), [Mohurtam.js](src/Mohurtam.js), [MuhurtamRequests.js](src/MuhurtamRequests.js), [AvailabilityManager.js](src/AvailabilityManager.js)
- **Description:** Get appointments for a specific priest

### `/api/appointments/{id}`

- **Method:** GET, PUT, DELETE
- **Files:** [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Get, update, or delete a specific appointment

### `/api/availability`

- **Method:** GET, POST, PUT, DELETE
- **Files:** [BookingModal.js](src/BookingModal.js), [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Manage priest availability slots

### `/api/availability/priest/{priestId}/date/{date}`

- **Method:** GET
- **Files:** [BookingModal.js](src/BookingModal.js), [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Get availability for specific priest on specific date

### `/api/availability/{priestId}`

- **Method:** GET
- **Files:** [AvailabilityManager.js](src/AvailabilityManager.js)
- **Description:** Get all availability slots for a priest

### `/api/availability/{id}`

- **Method:** PUT, DELETE
- **Files:** [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Update or delete availability slot

---

## 🙏 Bookings & Muhurtam (Auspicious Timing) Requests

### `/api/booking`

- **Method:** GET, POST
- **Files:** [BookingModal.js](src/BookingModal.js), [ManageAppointments.js](src/admin/ManageAppointments.js)
- **Description:** Create booking

### `/api/booking/priest/{priestId}`

- **Method:** GET
- **Files:** [Calendar.js](src/Calendar.js), [Dashboard.js](src/Dashboard.js), [Mohurtam.js](src/Mohurtam.js), [MuhurtamRequests.js](src/MuhurtamRequests.js), [Navbar.js](src/Navbar.js), [AvailabilityManager.js](src/AvailabilityManager.js)
- **Description:** Get bookings for specific priest

### `/api/booking/customer/{customerId}`

- **Method:** GET
- **Files:** [YourBookings.js](src/YourBookings.js), [CustomerNavbar.js](src/CustomerNavbar.js)
- **Description:** Get bookings for specific customer

### `/api/booking/all`

- **Method:** GET
- **Files:** [ManageAppointments.js](src/admin/ManageAppointments.js)
- **Description:** Get all bookings (admin only)

### `/api/booking/{id}`

- **Method:** GET, PUT, DELETE
- **Files:** [ManageAppointments.js](src/admin/ManageAppointments.js)
- **Description:** Get, update, or delete specific booking

### `/api/booking/{action}/{id}` (action: accept, reject, cancel, etc.)

- **Method:** PUT
- **Files:** [Dashboard.js](src/Dashboard.js), [MuhurtamRequests.js](src/MuhurtamRequests.js), [ManageAppointments.js](src/admin/ManageAppointments.js)
- **Description:** Update booking status with action

### `/api/muhurtam`

- **Method:** GET, POST
- **Files:** [Dashboard.js](src/Dashboard.js), [Mohurtam.js](src/Mohurtam.js)
- **Description:** Get muhurtam requests or create new one

### `/api/muhurtam/request`

- **Method:** POST
- **Files:** [AskForMuhurtam.js](src/AskForMuhurtam.js)
- **Description:** Submit muhurtam request

### `/api/muhurtam/priest/{priestId}`

- **Method:** GET
- **Files:** [Dashboard.js](src/Dashboard.js), [MuhurtamRequests.js](src/MuhurtamRequests.js), [Navbar.js](src/Navbar.js)
- **Description:** Get muhurtam requests for specific priest

### `/api/muhurtam/customer/{customerId}`

- **Method:** GET
- **Files:** [YourBookings.js](src/YourBookings.js), [CustomerNavbar.js](src/CustomerNavbar.js)
- **Description:** Get muhurtam requests for specific customer

### `/api/muhurtam/all`

- **Method:** GET
- **Files:** [ManageMuhurtamRequests.js](src/admin/ManageMuhurtamRequests.js)
- **Description:** Get all muhurtam requests (admin only)

### `/api/muhurtam/find`

- **Method:** POST
- **Files:** [Mohurtam.js](src/Mohurtam.js)
- **Description:** Find auspicious timings based on criteria

### `/api/muhurtam/{id}/viewed`

- **Method:** PUT
- **Files:** [Dashboard.js](src/Dashboard.js), [MuhurtamRequests.js](src/MuhurtamRequests.js), [ManageMuhurtamRequests.js](src/admin/ManageMuhurtamRequests.js)
- **Description:** Mark muhurtam request as viewed

---

## 🎉 Events & Pooja Services

### `/api/events`

- **Method:** GET, POST
- **Files:** [Dashboard.js](src/Dashboard.js), [BookPriest.js](src/BookPriest.js), [SignUp.js](src/SignUp.js), [ManagePoojaServices.js](src/admin/ManagePoojaServices.js), [ManagePriests.js](src/admin/ManagePriests.js), [ManagePoojaItems.js](src/admin/ManagePoojaItems.js), [ManageAppointments.js](src/admin/ManageAppointments.js)
- **Description:** Get all events/pooja services or create new

### `/api/events/{id}`

- **Method:** GET, PUT, DELETE
- **Files:** [ManagePoojaServices.js](src/admin/ManagePoojaServices.js), [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Get, update, or delete specific event/service

### `/api/dashboard/events`

- **Method:** GET, POST
- **Files:** [DashboardEventsDisplay.js](src/DashboardEventsDisplay.js), [ManageEvents.js](src/admin/ManageEvents.js)
- **Description:** Get dashboard events or create new

### `/api/dashboard/events/{id}`

- **Method:** PUT, DELETE
- **Files:** [ManageEvents.js](src/admin/ManageEvents.js)
- **Description:** Update or delete dashboard event

### `/api/dashboard/events/priest/{priestId}`

- **Method:** GET
- **Files:** [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Get events for specific priest

---

## 🕉️ Astrological Data (Panchang)

### `/api/nakshatram`

- **Method:** GET, POST
- **Files:** [ManagePanchangam.js](src/admin/ManagePanchangam.js), [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Get all nakshatras (lunar mansions)

### `/api/nakshatram/{id}`

- **Method:** GET, PUT, DELETE
- **Files:** [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Get, update, or delete specific nakshatra

### `/api/panchangam`

- **Method:** GET, POST
- **Files:** [ManagePanchangam.js](src/admin/ManagePanchangam.js)
- **Description:** Get or create panchangam data

### `/api/panchangam/{id}`

- **Method:** PUT, DELETE
- **Files:** [ManagePanchangam.js](src/admin/ManagePanchangam.js)
- **Description:** Update or delete panchangam data

### `/api/panchangam/month?year={year}&month={month}`

- **Method:** GET
- **Files:** [Calendar.js](src/Calendar.js), [Mohurtam.js](src/Mohurtam.js)
- **Description:** Get panchangam data for specific month

### `/api/festivals`

- **Method:** GET, POST
- **Files:** [ManageFestivals.js](src/admin/ManageFestivals.js)
- **Description:** Get all festivals or create new

### `/api/festivals/{id}`

- **Method:** PUT, DELETE
- **Files:** [ManageFestivals.js](src/admin/ManageFestivals.js)
- **Description:** Update or delete festival

### `/api/festivals/month?year={year}&month={month}`

- **Method:** GET
- **Files:** [Calendar.js](src/Calendar.js), [Mohurtam.js](src/Mohurtam.js)
- **Description:** Get festivals for specific month

---

## ☀️ Timing & Sun Position Calculations

### `/api/sun?date={date}&lat={lat}&lon={lon}&tz={tz}`

- **Method:** GET
- **Files:** [Dashboard.js](src/Dashboard.js), [Calendar.js](src/Calendar.js), [Mohurtam.js](src/Mohurtam.js)
- **Description:** Get sun position and timing data (sunrise/sunset)

### `/api/daily-times`

- **Method:** GET, POST
- **Files:** [ManageDailyTimes.js](src/admin/ManageDailyTimes.js)
- **Description:** Get all daily times or create new

### `/api/daily-times/{id}`

- **Method:** PUT, DELETE
- **Files:** [ManageDailyTimes.js](src/admin/ManageDailyTimes.js)
- **Description:** Update or delete daily time

### `/api/daily-times/calculate?date={date}&lat={lat}&lon={lon}&tz={tz}`

- **Method:** GET
- **Files:** [Dashboard.js](src/Dashboard.js), [Mohurtam.js](src/Mohurtam.js), [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Calculate daily times for specific location

### `/api/daily-times/by-date/{dateStr}`

- **Method:** GET
- **Files:** [Calendar.js](src/Calendar.js)
- **Description:** Get daily times for specific date

---

## 📸 Gallery

### `/api/gallery/all-random`

- **Method:** GET
- **Files:** [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Get random gallery images

### `/api/gallery/priest/{priestId}`

- **Method:** GET
- **Files:** [PriestGallery.js](src/PriestGallery.js)
- **Description:** Get gallery images for specific priest

### `/api/gallery/upload`

- **Method:** POST
- **Files:** [PriestGallery.js](src/PriestGallery.js)
- **Description:** Upload gallery image

### `/api/gallery/{imageId}`

- **Method:** DELETE
- **Files:** [PriestGallery.js](src/PriestGallery.js)
- **Description:** Delete specific gallery image

---

## 📚 Knowledge Base

### `/api/knowledgebase/{priestId}`

- **Method:** GET
- **Files:** [Dashboard.js](src/Dashboard.js), [KnowledgeBase.js](src/KnowledgeBase.js)
- **Description:** Get knowledge base content for priest

### `/api/knowledgebase`

- **Method:** POST
- **Files:** [KnowledgeBase.js](src/KnowledgeBase.js)
- **Description:** Create knowledge base content

---

## 🍲 Pooja Items

### `/api/pooja-items/event/{eventId}`

- **Method:** GET
- **Files:** [ManagePoojaItems.js](src/admin/ManagePoojaItems.js)
- **Description:** Get pooja items for specific event

### `/api/pooja-items/add`

- **Method:** POST
- **Files:** [ManagePoojaItems.js](src/admin/ManagePoojaItems.js)
- **Description:** Add new pooja item

### `/api/pooja-items/update/{itemId}`

- **Method:** PUT
- **Files:** [ManagePoojaItems.js](src/admin/ManagePoojaItems.js)
- **Description:** Update pooja item

### `/api/pooja-items/delete/{itemId}`

- **Method:** DELETE
- **Files:** [ManagePoojaItems.js](src/admin/ManagePoojaItems.js)
- **Description:** Delete pooja item

---

## 🙌 Prasadam (Offerings)

### `/api/prasadam`

- **Method:** GET, POST, PUT, DELETE (BASE)
- **Files:** [ManagePrasadams.js](src/admin/ManagePrasadams.js)
- **Description:** Manage prasadam items

---

## 📦 Orders

### `/api/orders/preparer/{preparerId}`

- **Method:** GET
- **Files:** [PrasadamPreparer.js](src/PrasadamPreparer.js)
- **Description:** Get orders for specific preparer

### `/api/orders/{orderId}/accept`

- **Method:** POST
- **Files:** [PrasadamPreparer.js](src/PrasadamPreparer.js)
- **Description:** Accept order

### `/api/orders/{orderId}/deliver`

- **Method:** POST
- **Files:** [PrasadamPreparer.js](src/PrasadamPreparer.js)
- **Description:** Mark order as delivered

---

## 📤 Other Utilities

### `/api/upload`

- **Method:** POST
- **Files:** [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Generic file upload endpoint

### `/api/bookings`

- **Method:** GET, POST
- **Files:** [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Get all bookings or create new

### `/api/bookings/{id}`

- **Method:** GET, PUT, DELETE
- **Files:** [config/apiConfig.js](src/config/apiConfig.js)
- **Description:** Get, update, or delete specific booking

---

## 📊 Summary Statistics

**Total Unique API Endpoints:** 65+  
**Total Files Using APIs:** 40+  
**Main Feature Categories:** 13

- Authentication & User Management (13 endpoints)
- Profile & User Information (5 endpoints)
- Appointments & Availability (7 endpoints)
- Bookings & Muhurtam (11 endpoints)
- Events & Pooja Services (5 endpoints)
- Astrological Data (9 endpoints)
- Timing & Sun Calculations (5 endpoints)
- Gallery (4 endpoints)
- Knowledge Base (2 endpoints)
- Pooja Items (4 endpoints)
- Prasadam (1 endpoint group)
- Orders (3 endpoints)
- Other Utilities (3 endpoints)

---

## 🔗 Base Configuration

All endpoints use the base URL defined in [apiConfig.js](src/config/apiConfig.js):

- **Environment Variable:** `REACT_APP_API_BASE_URL`
- **Default:** `http://process.env.REACT_APP_API_BASE_URL`
- **Timeout:** 30000ms (configurable via `REACT_APP_API_TIMEOUT`)
