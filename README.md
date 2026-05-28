# 🍕 Order Tracking API

A production-ready REST API for food order tracking with **real-time updates** via Socket.io. Built with **TypeScript**, **Node.js**, **Express.js**, **PostgreSQL**, and **Prisma ORM**.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Database Models](#-database-models)
- [API Reference](#-api-reference)
- [Authentication](#-authentication)
- [Real-time Features](#-real-time-features)
- [Error Handling](#-error-handling)
- [Response Format](#-response-format)
- [Demo Credentials](#-demo-credentials)

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Runtime** | Node.js + TypeScript |
| **Framework** | Express.js v5 |
| **Database** | PostgreSQL with Prisma ORM v7 |
| **Real-time** | Socket.io v4 |
| **Authentication** | JWT (Access + Refresh tokens) |
| **Validation** | Zod |
| **Password Hashing** | bcryptjs |
| **Package Manager** | pnpm v10 |
| **Development** | ts-node-dev |

---

## 📁 Project Structure

```
order-tracker-server/
├── prisma/
│   ├── schema/
│   │   ├── schema.prisma       # Generator & datasource config
│   │   ├── enums.prisma        # Shared enums (Role, OrderStatus, FoodCategory)
│   │   ├── user.prisma         # User model
│   │   ├── food.prisma         # Food/Menu item model
│   │   └── order.prisma        # Order model with relations
│   ├── migrations/             # Database migration history
│   └── seed.ts                 # Database seeding script
│
├── src/
│   ├── app.ts                  # Express app configuration
│   ├── server.ts               # HTTP server + Socket.io + Graceful shutdown
│   │
│   └── app/
│       ├── config/
│       │   ├── env.config.ts       # Environment variables validation (Zod)
│       │   ├── cors.config.ts      # CORS configuration
│       │   ├── socket.config.ts    # Socket.io setup & authentication
│       │   └── seed.ts             # Database seeding
│       │
│       ├── middlewares/
│       │   ├── auth.middleware.ts      # JWT authentication & user extraction
│       │   ├── role.middleware.ts      # Role-based access control (USER/ADMIN)
│       │   ├── error.middleware.ts     # Global error handler & 404 handler
│       │   └── validate.middleware.ts  # Zod request validation middleware
│       │
│       ├── modules/
│       │   ├── auth/
│       │   │   ├── auth.routes.ts      # POST /register, /login, /logout, /me, /change-password
│       │   │   ├── auth.controller.ts  # Auth logic
│       │   │   ├── auth.service.ts     # Business logic
│       │   │   └── auth.validation.ts  # Zod schemas
│       │   │
│       │   ├── food/
│       │   │   ├── food.routes.ts      # GET /foods, POST /foods, PUT, PATCH, DELETE
│       │   │   ├── food.controller.ts  # Food endpoints
│       │   │   ├── food.service.ts     # Food business logic
│       │   │   └── food.validation.ts  # Food request schemas
│       │   │
│       │   ├── order/
│       │   │   ├── order.routes.ts     # Order CRUD & admin routes
│       │   │   ├── order.controller.ts # Order endpoints
│       │   │   ├── order.service.ts    # Order business logic
│       │   │   └── order.validation.ts # Order schemas
│       │   │
│       │   ├── user/
│       │   │   ├── user.routes.ts      # User profile & admin user management
│       │   │   ├── user.controller.ts  # User endpoints
│       │   │   ├── user.service.ts     # User business logic
│       │   │   └── user.validation.ts  # User schemas
│       │   │
│       │   └── admin/
│       │       ├── admin.routes.ts     # GET /dashboard, /analytics/revenue
│       │       ├── admin.controller.ts # Admin dashboard endpoints
│       │       └── admin.service.ts    # Analytics business logic
│       │
│       ├── types/
│       │   ├── express.d.ts       # Express Request type augmentation (req.user)
│       │   └── socket.d.ts        # Socket type augmentation
│       │
│       └── utils/
│           ├── ApiError.ts        # Custom error class with factory methods
│           ├── ApiResponse.ts     # Standard response wrapper + pagination helper
│           ├── asyncHandler.ts    # Async route wrapper to catch errors
│           ├── jwt.utils.ts       # JWT token generation/verification
│           ├── cookie.utils.ts    # Cookie helpers
│           └── prisma.ts          # Prisma singleton + health check
│
├── .env.example                # Environment template
├── package.json
├── tsconfig.json
├── prisma.config.ts            # Prisma configuration
└── README.md
```

---

## 🚀 Installation & Setup

### 1. Prerequisites

- Node.js v18+
- PostgreSQL v12+
- pnpm v10+

### 2. Clone & Install

```bash
git clone https://github.com/asrafulsgit/order-tracking-server.git
cd order-tracker-server
pnpm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Setup Database

```bash
# Create migrations
pnpm exec prisma migrate dev --name init

# Seed demo data
pnpm seed
```

### 5. Start Development Server

```bash
pnpm dev
```

Server runs on `http://localhost:5000` with Socket.io on same port

---

## 🔑 Environment Variables

```env
# ─── Application ─────────────────────────────────
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

# ─── Database ─────────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/foodhub?schema=public"

# ─── JWT Authentication ───────────────────────────
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ─── Security ──────────────────────────────────────
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX=100               # Max requests per window

# ─── CORS ──────────────────────────────────────────
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# ─── Logging ───────────────────────────────────────
LOG_LEVEL=info
LOG_DIR=logs
```

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NODE_ENV` | string | ✅ | — | Environment: `development`, `production`, `test` |
| `PORT` | number | ✅ | — | Server port |
| `API_PREFIX` | string | ✅ | — | API base path (e.g., `/api/v1`) |
| `DATABASE_URL` | string | ✅ | — | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | string | ✅ | — | Min 32 characters for security |
| `JWT_REFRESH_SECRET` | string | ✅ | — | Min 32 characters for security |
| `JWT_ACCESS_EXPIRES_IN` | string | ❌ | `15m` | Token TTL (15m, 1h, 7d, etc.) |
| `JWT_REFRESH_EXPIRES_IN` | string | ❌ | `7d` | Refresh token TTL |
| `BCRYPT_SALT_ROUNDS` | number | ❌ | `12` | Password hashing iterations (10-14 recommended) |
| `ALLOWED_ORIGINS` | string | ❌ | `http://localhost:3000` | Comma-separated CORS origins |

---

## 📊 Database Models

### User
```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  password     String   (hashed with bcrypt)
  role         Role     @default(USER)  // USER | ADMIN
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
  orders       Order[]
}
```

### Food
```prisma
model Food {
  id          String       @id @default(uuid())
  name        String
  description String
  price       Decimal      // 10.2 precision (e.g., 9999.99)
  category    FoodCategory // Pizza | Burger | Sushi | Pasta | Salad | Dessert | Drink | Asian
  image_url   String?
  available   Boolean      @default(true)
  created_at  DateTime     @default(now())
  updated_at  DateTime     @updatedAt
  orders      Order[]
}
```

### Order
```prisma
model Order {
  id         String      @id @default(uuid())
  user_id    String
  food_id    String
  quantity   Int         @default(1)
  total      Decimal     // Order total amount
  status     OrderStatus @default(ORDERED)  // ORDERED | IN_PROGRESS | DELIVERY | COMPLETED | CANCELLED
  address    String      // Delivery address
  notes      String?     // Special instructions
  created_at DateTime    @default(now())
  updated_at DateTime    @updatedAt
  user       User        @relation(fields: [user_id], references: [id])
  food       Food        @relation(fields: [food_id], references: [id])
}
```

### Enums
```prisma
enum Role {
  USER      // Regular customer
  ADMIN     // Administrator
}

enum OrderStatus {
  ORDERED      // Initial order state
  IN_PROGRESS  // Being prepared
  DELIVERY     // Out for delivery
  COMPLETED    // Successfully delivered
  CANCELLED    // Order cancelled
}

enum FoodCategory {
  Pizza, Burger, Sushi, Pasta, Salad, Dessert, Drink, Asian
}
```

---

## 📡 API Reference

### Root Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API info & version |
| `GET` | `/health` | Health check |

### 🔐 Authentication — `/api/v1/auth`

#### Public Routes

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| `POST` | `/register` | `{ name, email, password }` | User + tokens |
| `POST` | `/login` | `{ email, password }` | User + tokens |

#### Protected Routes

| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| `GET` | `/me` | 🔒 Any | Current user profile |
| `PATCH` | `/change-password` | 🔒 Any | `{ message }` |
| `GET` | `/logout` | 🔒 Any | `{ message }` |

---

### 🍕 Foods — `/api/v1/foods`

#### Public Route
| Method | Endpoint | Query Params | Auth | Response |
|--------|----------|--------------|------|----------|
| `GET` | `/` | `page`, `limit`, `search`, `category`, `available`, `minPrice`, `maxPrice`, `sortBy`, `sortOrder` | — | Foods array with pagination |

#### Protected Routes (User)
| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| `GET` | `/categories` | 🔒 User | Category counts |
| `GET` | `/:id` | 🔒 User | Food details |

#### Admin Routes
| Method | Endpoint | Body | Auth | Response |
|--------|----------|------|------|----------|
| `POST` | `/` | Food object | 👑 Admin | Created food |
| `PUT` | `/:id` | Updated fields | 👑 Admin | Updated food |
| `PATCH` | `/:id/toggle` | — | 👑 Admin | Availability toggled |
| `DELETE` | `/:id` | — | 👑 Admin | `{ message }` |

**Sort Options:** `name`, `price`, `created_at`  
**Sort Order:** `asc`, `desc`

---

### 🛒 Orders — `/api/v1/orders`

#### User Routes

| Method | Endpoint | Purpose | Query/Body | Auth | Response |
|--------|----------|---------|-----------|------|----------|
| `POST` | `/` | Place order | `{ food_id, quantity, address, notes? }` | 🔒 User | Created order |
| `GET` | `/my` | My orders | `page`, `limit`, `status`, `sortBy`, `sortOrder` | 🔒 User | Orders array |
| `GET` | `/dashboard` | User dashboard | — | 🔒 User | Stats & recent orders |
| `GET` | `/:id` | Order details | — | 🔒 User | Order (if owner) |
| `PATCH` | `/:id/cancel` | Cancel order | — | 🔒 User | Cancelled order (status=ORDERED only) |

#### Admin Routes

| Method | Endpoint | Purpose | Query/Body | Auth | Response |
|--------|----------|---------|-----------|------|----------|
| `GET` | `/` | All orders | `page`, `limit`, `status`, `search`, `sortBy`, `sortOrder`, `from`, `to` | 👑 Admin | Orders with pagination |
| `GET` | `/:id/admin` | Order details | — | 👑 Admin | Any order by ID |
| `PATCH` | `/:id/status` | Update status | `{ status }` | 👑 Admin | Updated order |

**Admin Query Params:** `page=1`, `limit=10`, `status=ORDERED`, `search=user_name`, `sortBy=created_at`, `sortOrder=desc`, `from=2026-01-01`, `to=2026-12-31`

---

### 👥 Users — `/api/v1/users`

| Method | Endpoint | Purpose | Body | Auth | Response |
|--------|----------|---------|------|------|----------|
| `PATCH` | `/profile` | Update own profile | `{ name }` | 🔒 Any | Updated user |
| `GET` | `/` | List all users | Query: `page`, `limit`, `search`, `sortBy` | 👑 Admin | Users array |
| `GET` | `/:id` | User details + orders | — | 👑 Admin | User + orders array |
| `PATCH` | `/:id/role` | Change role | `{ role }` | 👑 Admin | Updated user |

---

### 📊 Admin — `/api/v1/admin`

| Method | Endpoint | Query Params | Auth | Response |
|--------|----------|--------------|------|----------|
| `GET` | `/dashboard` | — | 👑 Admin | KPIs: total users, orders, revenue, etc. |
| `GET` | `/analytics/revenue` | `days=30` (7-90) | 👑 Admin | Daily revenue breakdown |

---

## 🔐 Authentication Flow

```
1. User registers or logs in
   POST /api/v1/auth/register or /login
   ↓
   Response: { accessToken, refreshToken, user }
   
2. Store tokens (cookie/localStorage)

3. Every API request
   Headers: { Authorization: "Bearer <accessToken>" }
   ↓
   Token verified by auth middleware

4. Token expires?
   POST /api/v1/auth/refresh with refreshToken
   ↓
   New accessToken issued
   
5. Logout
   GET /api/v1/auth/logout
   ↓
   Session invalidated
```

**Token Details:**
- **Access Token:** Short-lived (15m default), included in every request
- **Refresh Token:** Long-lived (7d default), stored securely to issue new access tokens
- Both are JWT signed with `HS256`

---

## 🔄 Real-time Features (Socket.io)

WebSocket events for real-time order updates, status changes, and notifications.

### Socket Authentication
```javascript
// Connect with token in Authorization header
const socket = io('http://localhost:5000', {
  auth: {
    token: 'Bearer <accessToken>'
  }
});
```

### Socket Rooms
- **User Room:** Each authenticated user joins their own room (`socket.userId`)
- **Admin Room:** All admins join `admin` room

### Socket Events (Bidirectional)
- Order placed → Real-time notification to admins
- Order status updated → Real-time notification to user
- New food added → Broadcast to all connected users
- Food availability toggled → Broadcast to all users

---

## 🛡️ Error Handling

### Error Response Format
```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "invalid_string"
    }
  ]
}
```

### Common Error Codes
| Status | Meaning | Example |
|--------|---------|---------|
| `400` | Bad Request | Invalid request body |
| `401` | Unauthorized | Missing/invalid token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate email |
| `422` | Unprocessable Entity | Validation error |
| `500` | Server Error | Unexpected error |

### Error Classes

```typescript
ApiError.badRequest(message, errors)     // 400
ApiError.unauthorized(message)           // 401
ApiError.forbidden(message)              // 403
ApiError.notFound(message)               // 404
ApiError.conflict(message)               // 409
ApiError.unprocessable(message, errors)  // 422
```

---

## ✅ Success Response Format

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Foods fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Margherita Pizza",
      "price": 12.99,
      "category": "Pizza",
      "available": true
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Response Codes
| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `204` | No Content |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `409` | Conflict |
| `422` | Validation Error |

---

## 🌱 Demo Credentials

After running `pnpm seed`, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@ordertrack.com` | `password123` |
| **User** | `karim@gmail.com` | `password123` |
| **User** | `sara@gmail.com` | `password123` |

---

## 📚 Available Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start development server (ts-node-dev) |
| `pnpm seed` | Seed database with demo data |
| `pnpm exec prisma migrate dev` | Create & apply migrations |
| `pnpm exec prisma studio` | Open Prisma Studio GUI |

---

## 🏗️ Architecture Highlights

✅ **Modular Design** — Separated concerns by feature (auth, food, order, user, admin)  
✅ **Type Safety** — Full TypeScript coverage  
✅ **Error Handling** — Custom error classes with factory methods  
✅ **Validation** — Zod schemas for request validation  
✅ **Authentication** — JWT with access + refresh token pattern  
✅ **Authorization** — Role-based middleware (USER/ADMIN)  
✅ **Real-time** — Socket.io for live order tracking  
✅ **Graceful Shutdown** — Proper connection cleanup on signals  
✅ **CORS** — Configurable origin-based security  
✅ **Response Standardization** — Consistent API response format  

---

## 📞 Support

For issues or questions, please create an issue on GitHub.

---

## 📄 License

Feel free to use this project for learning and commercial purposes. 
