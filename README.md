# 📚 BookNook Server API

> The official backend RESTful API service for the **BookNook** library management web application. Built with Node.js, Express, MongoDB Native Driver, and protected with JWT-based authorization.

[![Node.js](https://img.shields.io/badge/Node.js-v20+-68A063?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

---

## 🌟 Key Features

- **📖 Books Catalog & Management:** Full CRUD operations for books with role/owner-based access control.
- **🔍 Search & Categorization:** Real-time keyword search across book titles and authors, plus category filtering (`Fiction`, `Science`, `History`, `Kids`, `Others`).
- **🔖 Borrowing System:** Secure borrowing mechanism with active borrow tracking, return date calculation (+7 days), and auto-inventory updates for available copies.
- **🔒 Secure Authentication & JWT Verification:** Protected routes verified with cryptographic JWT tokens (JWKS) to prevent identity spoofing.
- **🩺 Health Monitoring:** Dedicated `/health` endpoint reporting uptime and system status.
- **⚡ Vercel Serverless Ready:** Seamless deployment on Vercel with ESM support.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (ES Modules / ESM)
- **Framework:** Express.js 5
- **Database:** MongoDB Atlas (Native MongoDB Node Driver)
- **Authentication:** Better-Auth & Jose (JWKS & JWT Verification)
- **Environment Management:** Dotenv
- **CORS:** Cross-Origin Resource Sharing with credentials support

---

## 📂 Project Structure

```text
BookNook/
├── db/
│   └── connect.js          # MongoDB connection helper with pooled client
├── lib/
│   └── auth.js             # Better-Auth initialization & adapters
├── middleware/
│   └── verifyJwt.js        # JWT verification middleware using remote JWKS
├── routes/
│   ├── books.js            # Books CRUD, search & filter routes
│   └── borrows.js          # Borrowing and return management routes
├── index.js                # Express app setup, CORS, route mounts & server listen
├── package.json            # Project dependencies and configurations
└── README.md               # API documentation
```

---

## 📡 API Reference

### Base URL
- **Local:** `http://localhost:5000`
- **Production:** `https://book-nook-servar.vercel.app`

---

### 1. System & Health

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | API welcome message |
| `GET` | `/health` | Public | Server uptime and status check |

---

### 2. Books API (`/books`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/books` | Public | Get all books. Supports `?category=` and `?search=` query parameters. |
| `GET` | `/books/:id` | Public | Get details of a single book by its MongoDB `_id`. |
| `POST` | `/books` | **Bearer Token** | Add a new book (Owner info extracted automatically from token). |
| `PATCH` | `/books/:id` | **Bearer Token** | Update a book (Only allowed by the user who created it). |
| `DELETE` | `/books/:id` | **Bearer Token** | Delete a book (Only allowed by the user who created it). |

#### Query Parameters for `GET /books`:
- `category`: Filter by category (e.g., `/books?category=Science`)
- `search`: Search query matching title or author (case-insensitive) (e.g., `/books?search=prince`)

---

### 3. Borrowing API (`/borrows`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/borrows` | **Bearer Token** | Fetch all active borrows belonging to the authenticated user. |
| `POST` | `/borrows` | **Bearer Token** | Borrow a book. Body: `{ "bookId": "..." }`. Decrements `availableCopies` by 1. |
| `DELETE` | `/borrows/:id` | **Bearer Token** | Return a borrowed book. Increments `availableCopies` by 1. |

---

### 4. Authentication Endpoints (`/api/auth`)

Mounted through Better-Auth to manage OAuth credentials and session handshakes:
- `ALL /api/auth/*` — Better-Auth request handler for login, sign-up, and session tokens.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Port
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/booknook

# Frontend Client URL
CLIENT_URL=http://localhost:3000

# Auth Base URL (Used for remote JWKS validation)
AUTH_BASE_URL=http://localhost:3000

# Better-Auth Configuration
BETTER_AUTH_SECRET=your_super_secret_key
BETTER_AUTH_URL=http://localhost:5000

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or pnpm
- MongoDB Atlas cluster URI or local MongoDB instance

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nahiyandev/BookNook-servar.git
   cd BookNook-servar
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the sample environment variables shown above into a `.env` file and update your MongoDB credentials.

4. **Start the Development Server:**
   ```bash
   node index.js
   ```
   Or run with nodemon:
   ```bash
   npx nodemon index.js
   ```

The server should log:
```text
You successfully connected to MongoDB!
Server is running on port 5000
```

---

## 🛡️ Security Highlights

1. **Token-First Verification:** User identification (`name`, `email`, `id`) is extracted strictly from cryptographically signed JWT tokens, mitigating payload tampering and impersonation.
2. **Resource Ownership Enforcement:** Users can only modify or delete books they originally published (`addedBy.email === req.user.email`).
3. **Protected Environmental Secrets:** All database URIs, OAuth credentials, and session keys are secured in `.env` and kept strictly out of git version control.
