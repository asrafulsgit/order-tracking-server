# 🍕 Order Tracking API

A production-ready REST API for food order tracking built with **TypeScript**, **Node.js**, **Express**, **PostgreSQL**, and **Prisma ORM**.

---

## 📁 Folder Structure

```
order-tracking/
├── prisma/
│   ├── schema/
│   │   ├── schema.prisma       # Generator + datasource
│   │   ├── enums.prisma        # Role, OrderStatus, FoodCategory
│   │   ├── user.prisma         # User model
│   │   ├── food.prisma         # Food model
│   │   └── order.prisma        # Order model
│   └── seed.ts                 # Database seeder
│
├── src/
│   ├── app/
│   │   ├── config/
│   │   │   ├── env.config.ts   # Env validation & typed config
│   │   │   └── cors.config.ts  # CORS options
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts       # JWT authentication
│   │   │   ├── role.middleware.ts       # Role-based access control
│   │   │   ├── error.middleware.ts      # Global error + 404 handler
│   │   │   ├── validate.middleware.ts   # Zod schema validation
│   │   │   └── rateLimiter.middleware.ts
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/    (register, login, logout, refresh, change-password)
│   │   │   ├── food/    (CRUD, search, filter, categories)
│   │   │   ├── order/   (place, track, cancel, admin management)
│   │   │   ├── user/    (profile, admin user management)
│   │   │   └── admin/   (dashboard KPIs, revenue analytics)
│   │   │
│   │   ├── types/
│   │   │   └── express.d.ts    # req.user type augmentation
│   │   │
│   │   └── utils/
│   │       ├── ApiError.ts     # Custom error class with factory methods
│   │       ├── ApiResponse.ts  # Consistent response + pagination helpers
│   │       ├── asyncHandler.ts # Async route wrapper
│   │       ├── jwt.utils.ts    # Token generation/verification
│   │       ├── logger.ts       # Winston logger
│   │       └── prisma.ts       # Prisma singleton + health check
│   │
│   ├── app.ts      # Express app setup
│   └── server.ts   # HTTP server + graceful shutdown
│
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Setup & Installation

### 1. Clone & Install

```bash
git clone <repo>
cd order-tracking
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT secrets
```

### 3. Run Migrations & Seed

```bash
npm run prisma:migrate:dev   # Run DB migrations
npm run seed                  # Seed demo data
```

### 4. Start Development Server

```bash
npm run dev
```

---

## 🔑 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | — (required) |
| `JWT_ACCESS_SECRET` | Secret for access tokens | — (required) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | — (required) |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `7d` |
| `PORT` | Server port | `5000` |
| `BCRYPT_SALT_ROUNDS` | Bcrypt cost factor | `12` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

---

## 📡 API Reference

### Authentication — `/api/v1/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/register` | Register new account | Public |
| `POST` | `/login` | Login & get tokens | Public |
| `POST` | `/refresh` | Refresh access token | Public |
| `POST` | `/logout` | Invalidate session | 🔒 Any |
| `GET` | `/me` | Get own profile | 🔒 Any |
| `PATCH` | `/change-password` | Change password | 🔒 Any |

### Foods — `/api/v1/foods`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | List foods (search, filter, sort, paginate) | 🔒 User |
| `GET` | `/categories` | Category counts | 🔒 User |
| `GET` | `/:id` | Food details | 🔒 User |
| `POST` | `/` | Create food | 👑 Admin |
| `PUT` | `/:id` | Update food | 👑 Admin |
| `PATCH` | `/:id/toggle` | Toggle availability | 👑 Admin |
| `DELETE` | `/:id` | Delete food | 👑 Admin |

**Query params (GET /):** `page`, `limit`, `search`, `category`, `available`, `minPrice`, `maxPrice`, `sortBy` (`name`\|`price`\|`created_at`), `sortOrder` (`asc`\|`desc`)

### Orders — `/api/v1/orders`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/` | Place order | 🔒 User |
| `GET` | `/my` | My orders (filtered) | 🔒 User |
| `GET` | `/dashboard` | User stats & recent orders | 🔒 User |
| `GET` | `/:id` | Order details (own only) | 🔒 User |
| `PATCH` | `/:id/cancel` | Cancel order | 🔒 User |
| `GET` | `/` | All orders | 👑 Admin |
| `GET` | `/:id/admin` | Any order by ID | 👑 Admin |
| `PATCH` | `/:id/status` | Update order status | 👑 Admin |

**Query params (admin GET /):** `page`, `limit`, `status`, `search`, `sortBy`, `sortOrder`, `from`, `to`

### Users — `/api/v1/users`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `PATCH` | `/profile` | Update own profile | 🔒 User |
| `GET` | `/` | List all users | 👑 Admin |
| `GET` | `/:id` | User details + orders | 👑 Admin |
| `PATCH` | `/:id/toggle-status` | Activate/deactivate | 👑 Admin |
| `PATCH` | `/:id/role` | Change role | 👑 Admin |

### Admin — `/api/v1/admin`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/dashboard` | Full KPI dashboard | 👑 Admin |
| `GET` | `/analytics/revenue?days=30` | Daily revenue chart | 👑 Admin |

---

## 🔐 Authentication Flow

```
Register/Login → { accessToken, refreshToken }

Every Request:   Authorization: Bearer <accessToken>

Token Expired?   POST /auth/refresh  { refreshToken }  → new token pair
```

---

## 🛡️ Error Response Format

```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format", "code": "invalid_string" }
  ]
}
```

## ✅ Success Response Format

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Foods fetched successfully",
  "data": [...],
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

---

## 🌱 Demo Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@ordertrack.com` | `password123` |
| User | `karim@gmail.com` | `password123` |
| User | `sara@gmail.com` | `password123` |
