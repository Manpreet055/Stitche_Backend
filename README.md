# Stitche Backend

Backend service for the **Stitche** e-commerce application.  
**Live Stitche e-commerce:** [stitche.vercel.app](https://stitche.vercel.app)
**Live Stitche API:** [stitche-api.onrender.com](https://stitche-api.onrender.com/health)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Run the Server](#run-the-server)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## Overview

**Stitche_Backend** provides RESTful APIs and backend services for the Stitche e-commerce platform.  
Production API: [stitche-api.onrender.com](https://stitche-api.onrender.com)

---

## Features

- RESTful API endpoints for Stitche clients
- MongoDB database integration via Mongoose
- JWT-based authentication
- Secure HTTP headers with Helmet
- Rate limiting and CORS support
- File uploads with Multer and Cloudinary integration
- Centralized error handling & validation
- Logging with Morgan
- Environment-based configuration

---

## Tech Stack

- **Backend Runtime / Framework:** Node.js + Express
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT
- **File Uploads:** Multer, Cloudinary
- **Tooling:** ESLint, Prettier, Nodemon, Docker (optional)

---

## Project Structure

```text
.
├── config/             # Configuration files (env, db, etc.)
├── controllers/        # API controllers (inbox, orders etc.)
├── middleware/         # Middleware (auth, error, rate-limiter etc.)
├── models/             # Document schemas
├── routes/             # API routes (auth, products, etc.)
├── utils               # utility functions
├── index.js            # Main entry point
├── package.json
├── .env
└── README.md
```

---

## Getting Started

### Prerequisites

- Git
- Node.js 18+
- MongoDB (local or cloud instance)

### Installation

```bash
git clone https://github.com/Manpreet055/Stitche_Backend.git
cd Stitche_Backend
npm install
```

### Environment Variables

Create a `.env` file in the project root. Example:

```env

MONGO_URI= your_mongo_uri_here
CORS_ORIGIN= your_cors_origin_here
CLOUDINARY_URL= your_cloudinary_url_here
PORT= your_port_here
CLOUDINARY_CLOUDNAME= your_cloudinary_cloudname_here
CLOUDINARY_API_KEY= your_cloudinary_api_key_here
CLOUDINARY_API_SECRET= your_cloudinary_api_secret_here
JWT_ACCESS_SECRET= your_jwt_access_secret_here
JWT_REFRESH_SECRET= your_jwt_refresh_secret_here
NODE_ENV=development
MAX_REFRESH_TOKENS= 5
ACCESS_TOKEN_EXPIRY= 15m
REFRESH_TOKEN_EXPIRY= 15d

```

---

## Run the Server

**Development (with hot reload):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

Server will be available at:  
`http://localhost:<PORT>`

---

## Scripts

- `dev` — run locally with hot-reload (`nodemon index.js`)
- `start` — run in production mode (`node index.js`)
- `lint` — lint the codebase (`eslint .`)
- `format` — format code with Prettier (`prettier --write .`)

---

## Deployment

- Use environment variables in production
- You can use Docker for consistent deployments:

```bash
docker build -t stitche-backend .
docker run -p 3000:3000 --env-file .env stitche-backend
```

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-change`
3. Commit changes: `git commit -m "Add my change"`
4. Push: `git push origin feature/my-change`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

- Open an issue in this repository
- Contact the maintainer: **@Manpreet055**
