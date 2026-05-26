# Library Management System

A local-first library management system built with React, Node.js, Express, and MongoDB.

## Features

- Admin and normal user roles
- Username/password authentication
- Sanitized inputs and MongoDB injection hardening
- Admin can add, update, delete, assign, and unassign books
- Admin can create and manage genres
- Users can search books, search by author, filter by genre, and view their assigned books with due dates
- Admin can view every lent book

## Local Setup

1. Install Node.js and MongoDB.
2. Create a `.env` file inside `server/` with:

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/library_management
   JWT_SECRET=replace-with-a-long-random-secret
   PORT=5000
   ```

3. Install dependencies from the repo root:

   ```bash
   npm install
   ```

4. Start both apps:

   ```bash
   npm run dev
   ```

5. Open the React app at the Vite URL shown in the terminal.

The admin account is seeded automatically on first run:

- Username: `admin`
- Password: `<seeded-password>`

## Deployment Notes (Vercel)

See **[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)** for full Atlas + Vercel setup.

Required Vercel environment variables:

- `MONGODB_URI` — MongoDB Atlas `mongodb+srv://...` connection string
- `JWT_SECRET` — long random secret

After deploy, test:

1. `https://<your-app>/api/health` — should respond immediately
2. `https://<your-app>/api/ready` — confirms database connection
3. Sign in with `admin` / `<seeded-password>`

## MongoDB

Create a MongoDB Atlas cluster, create a database user, whitelist your IP, and copy the connection string into `server/.env`.
