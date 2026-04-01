# Verma Studios

Verma Studios is a full-stack application built with Next.js for the frontend and Node.js/Express with Prisma on the backend.

## Project Structure

This is a monorepo setup consisting of two main directories:

- `/backend`: The Node.js Express API using Prisma ORM.
- `/vermastudios`: The Next.js frontend application.

## Prerequisites

- Node.js (v18 or higher recommended)
- A MySQL or PostgreSQL database (as configured in the backend `.env`)

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env` file (you can use whatever existing structure is present there):
   ```env
   PORT=5000
   DATABASE_URL="your-database-url"
   ```
4. Run Prisma DB generation and migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd vermastudios
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

The frontend should now be running typically on `localhost:3000` (or another port if specified), and the backend on the port specified in your `.env`.

## Scripts

### Backend (`/backend`)
- `npm run dev`: Starts the backend server with `nodemon`
- `npm run start`: Starts the backend server locally
- `npm run prisma:generate`: Generates Prisma client
- `npm run prisma:migrate`: Runs pending migrations using Prisma
- `npm run prisma:studio`: Opens Prisma Studio for managing data

### Frontend (`/vermastudios`)
- `npm run dev`: Starts Next.js development server
- `npm run build`: Builds the application for production
- `npm run start`: Starts a production Next.js server
- `npm run lint`: Runs ESLint
