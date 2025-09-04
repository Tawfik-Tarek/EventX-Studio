# EventX Studio

EventX Studio is a comprehensive event management platform built with a modern full-stack architecture. It allows users to browse events, book tickets, and manage their attendance, while providing administrators with powerful tools for event creation, analytics, and attendee insights.

## Features

### User Features

- **User Registration & Authentication**: Secure signup and login with JWT tokens
- **Event Browsing**: View upcoming and active events with detailed information
- **Ticket Booking**: Reserve seats for events with real-time availability
- **QR Code Tickets**: Digital tickets with QR codes for easy check-in
- **Personal Dashboard**: View booked tickets
- **Notifications**: Receive updates about events and ticket status
- **Profile Management**

### Admin Features

- **Event Management**: Create, update, and delete events
- **Analytics Dashboard**: Comprehensive statistics and insights
- **Attendee Demographics**: Detailed analysis of event attendees
- **Revenue Tracking**: Monitor ticket sales and revenue over time
- **Notification System**: Send broadcasts or targeted notifications
- **Seat Management**: Dynamic seat mapping and availability tracking

## Tech Stack

### Backend

- **Node.js** with **Express.js** for server-side logic
- **MongoDB** with **Mongoose** for data persistence
- **JWT** for authentication
- **bcryptjs** for password hashing
- **QRCode** for generating ticket QR codes
- **Joi** for input validation
- **CORS** for cross-origin requests

### Frontend

- **React 19** with **Vite** for fast development
- **React Router** for client-side routing
- **Tailwind CSS** for styling
- **Shadcn** components for accessible UI elements
- **React Hook Form** with **Zod** for form validation
- **Chart.js** for data visualization
- **React Toastify** for notifications
- **Lucide React** for icons

## Project Structure

```
EventX Studio/
├── Backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── notificationController.js
│   │   └── ticketController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models/
│   │   ├── Event.js
│   │   ├── Notification.js
│   │   ├── Ticket.js
│   │   └── User.js
│   ├── routes/
│   │   ├── analyticsRoutes.js
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── ticketRoutes.js
│   ├── utils/
│   │   ├── createDefaultAdmin.js
│   │   ├── qrGenerator.js
│   │   └── seeder.js
│   ├── index.js
│   ├── package.json
│   └── README.md
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   └── ...
│   │   ├── config/
│   │   ├── contexts/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
└── README.md
```

## Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the Backend directory:

   ```bash
   cd Backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the Backend directory with the following variables:

   ```
   MONGODB_URI=mongodb://localhost:27017/eventx-studio
   JWT_SECRET=your-super-secret-jwt-key
   PORT=4000
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the Frontend directory:

   ```bash
   cd Frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## Usage

### Default Admin Account

When the backend starts, a default admin account is created:

- Email: tawfik@eventex.com
- Password: password123

User Account

- Email: collin27@yahoo.com
- Password: password123

### User Registration

1. Visit the registration page
2. Fill in your details (name, email, password, age, gender, interests, location)
3. Submit the form to create your account

### Event Management (Admin)

1. Log in with admin credentials
2. Navigate to the dashboard
3. Create new events with details like title, description, date, venue, price, and total seats
4. Monitor analytics and attendee demographics

### Ticket Booking

1. Browse available events
2. Select an event and choose available seats
3. Complete the checkout process
4. Receive a QR code for your ticket

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires auth)

### Event Endpoints

- `GET /api/events` - Get all events (with optional filters)
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event (admin only)
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Ticket Endpoints

- `POST /api/tickets/checkout` - Book tickets (requires auth)
- `GET /api/tickets/my-tickets` - Get user's tickets (requires auth)

### Analytics Endpoints (Admin Only)

- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/demographics` - Attendee demographics
- `GET /api/analytics/demographics/:eventId` - Event-specific demographics
- `GET /api/analytics/per-event` - Per-event statistics
- `GET /api/analytics/revenue` - Revenue over time
- `GET /api/analytics/export/per-event.csv` - Export per-event data as CSV

### Notification Endpoints

- `GET /api/notifications` - Get user notifications (requires auth)
- `GET /api/notifications/unread` - Get unread notification count
- `PUT /api/notifications/mark-all/read` - Mark all notifications as read
- `PUT /api/notifications/:id/read` - Mark specific notification as read
- `POST /api/notifications` - Create notification (admin only)
- `GET /api/notifications/stream` - Stream notifications

## Author

<h3>Tawfik Tarek</h3>
