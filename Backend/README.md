# EventX Studio Backend API

A comprehensive backend API for EventX Studio - an event management system built with Node.js, Express, and MongoDB. This system supports role-based authentication (Admin & User), event management, ticket booking, and analytics.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Event Management**: Full CRUD operations for events with dynamic seat maps
- **Ticket Booking**: Seat selection, QR code generation, and booking management
- **Analytics Dashboard**: Revenue tracking, attendee demographics, and event insights
- **Real-time Updates**: Automatic seat availability updates
- **QR Code Integration**: Generate and validate QR codes for ticket verification

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **QR Code Generation**: qrcode library
- **Development**: nodemon for hot reloading

## 📁 Project Structure

```
Backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js    # Authentication logic (register, login, profile)
│   ├── eventController.js   # Event CRUD operations
│   ├── ticketController.js  # Ticket booking and management
│   └── analyticsController.js # Dashboard analytics and reports
├── middleware/
│   └── auth.js              # JWT authentication and admin authorization
├── models/
│   ├── User.js              # User schema with demographics
│   ├── Event.js             # Event schema with seat management
│   └── Ticket.js            # Ticket schema with QR codes
├── routes/
│   ├── authRoutes.js        # Authentication endpoints
│   ├── eventRoutes.js       # Event management endpoints
│   ├── ticketRoutes.js      # Ticket booking endpoints
│   └── analyticsRoutes.js   # Analytics and reporting endpoints
├── utils/
│   └── qrGenerator.js       # QR code generation utility
├── .env                     # Environment variables (local)
├── .env.example             # Environment variables template
├── index.js                 # Main application entry point
├── package.json             # Dependencies and scripts
└── README.md               # This documentation
```

## 🔧 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation Steps

1. **Clone the repository**

   ```bash
   cd Backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/eventx-studio
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

   **MongoDB Connection**: The app uses modern MongoDB driver (v4.0.0+) with automatic topology management and URL parsing.

4. **Start the development server**

   ```bash
   npm run dev
   ```

   **Default Admin User**: When the server starts for the first time, it automatically creates a default admin user:

   - **Name**: Tawfik Tarek
   - **Email**: tawfik@gmail.com
   - **Password**: admin123
   - **Role**: admin

5. **For production**
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000` (or your configured PORT).

## 🔐 Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **Admin**: Can create, update, delete events and view analytics
- **User**: Can browse events, book tickets, and manage their bookings

## 📊 Database Models

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['admin', 'user'], default: 'user'),
  age: Number,
  gender: String (enum: ['male', 'female', 'other']),
  interests: [String],
  location: String,
  createdAt: Date
}
```

### Event Model

```javascript
{
  title: String (required),
  description: String (required),
  date: Date (required),
  venue: String (required),
  price: Number (required, min: 0),
  totalSeats: Number (required, min: 1),
  availableSeats: Number (required, min: 0),
  seatMap: [
    { number: Number, status: 'available' | 'booked' | 'blocked' }
  ],
  status: String (enum: ['upcoming', 'active', 'closed']),
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date
}
```

### Ticket Model

```javascript
{
  eventId: ObjectId (ref: 'Event', required),
  userId: ObjectId (ref: 'User', required),
  seatNumber: Number (required),
  qrCode: String (required), // Base64 encoded QR code
  status: String (enum: ['booked', 'used']),
  bookingDate: Date,
  usedDate: Date
}
```

## 🌐 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint    | Description       | Access        |
| ------ | ----------- | ----------------- | ------------- |
| POST   | `/register` | Register new user | Public        |
| POST   | `/login`    | User login        | Public        |
| GET    | `/profile`  | Get user profile  | Authenticated |

### Event Routes (`/api/events`)

| Method | Endpoint | Description                                                          | Access          |
| ------ | -------- | -------------------------------------------------------------------- | --------------- |
| GET    | `/`      | Get events (filters: search, status, price, date; pagination & sort) | Public          |
| GET    | `/:id`   | Get event by ID                                                      | Public          |
| POST   | `/`      | Create new event                                                     | Admin           |
| PUT    | `/:id`   | Update event                                                         | Authenticated\* |
| DELETE | `/:id`   | Delete event                                                         | Authenticated\* |

\*Users can only update/delete their own events, Admins can modify any event

### Ticket Routes (`/api/tickets`)

| Method | Endpoint      | Description                 | Access        |
| ------ | ------------- | --------------------------- | ------------- |
| POST   | `/checkout`   | Simulated payment + booking | Authenticated |
| GET    | `/my-tickets` | Get user's tickets          | Authenticated |

### Analytics Routes (`/api/analytics`)

| Method | Endpoint                | Description                       | Access |
| ------ | ----------------------- | --------------------------------- | ------ |
| GET    | `/dashboard`            | Get dashboard stats               | Admin  |
| GET    | `/demographics`         | Get attendee demographics         | Admin  |
| GET    | `/per-event`            | Per-event sales / occupancy stats | Admin  |
| GET    | `/revenue`              | Revenue over time (day/month)     | Admin  |
| GET    | `/export/per-event.csv` | CSV export of per-event stats     | Admin  |

## 📋 API Usage Examples

### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user",
  "age": 25,
  "gender": "male",
  "interests": ["technology", "music"],
  "location": "New York"
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Event (Admin Only)

```bash
POST /api/events
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Tech Conference 2025",
  "description": "Annual technology conference",
  "date": "2025-12-01T10:00:00Z",
  "venue": "Convention Center",
  "price": 99.99,
  "totalSeats": 500,
}
```

### Simulated Checkout

```bash
POST /api/tickets/checkout
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "eventId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "seatNumber": 15,
  "cardLast4": "4242",
  "amount": 99.99
}
```

### Revenue Over Time

```bash
GET /api/analytics/revenue?from=2025-01-01&to=2025-12-31&granularity=month
Authorization: Bearer <jwt-token>
```

### Export Per-Event CSV

```bash
GET /api/analytics/export/per-event.csv
Authorization: Bearer <jwt-token>
```

### Get Dashboard Analytics (Admin Only)

```bash
GET /api/analytics/dashboard
Authorization: Bearer <jwt-token>
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin/User permissions
- **Input Validation**: Middleware for request validation
- **CORS Support**: Cross-origin resource sharing enabled
- **Error Handling**: Comprehensive error handling middleware

## 📈 Analytics & Reporting

The analytics system provides:

- **Dashboard Metrics**: Total events, tickets sold, revenue, user count
- **Demographic Data**: Age groups, gender distribution, interests, locations
- **Event Insights**: Recent events, upcoming events, booking trends
- **Revenue Tracking**: Total, per-event, and time-series revenue calculations
- **Occupancy Metrics**: Seat utilization percentage per event
- **CSV Export**: Downloadable event performance stats

## 🛠 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm test` - Run tests (not implemented yet)

### Environment Variables

- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing

### Error Handling

The API includes comprehensive error handling:

- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource not found)
- 500: Internal Server Error (server errors)

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure MongoDB Atlas for production database
- [ ] Set up proper CORS origins
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging

## 📝 License

This project is licensed under the ISC License.

## 👥 Author

**Tawfik Tarek**
