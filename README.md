# JualHP - Phone E-Commerce

Full-stack e-commerce platform for selling phones.

## Tech Stack

- **Backend**: Express.js + PostgreSQL + JWT
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Admin**: React + Vite + TypeScript
- **Container**: Docker + Docker Compose

## Quick Start with Docker

```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### Access Points:
- **User Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432

### Default Admin Account:
- Email: `admin@jualHP.com`
- Password: `bonacool`

## Services

| Service | Port | Description |
|---------|------|-------------|
| postgres | 5432 | PostgreSQL database |
| backend | 3000 | Express.js API |
| frontend | 5173 | User storefront |
| admin | 8080 | Admin panel |

## Docker Commands

```bash
# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build backend

# Remove volumes (clears database)
docker-compose down -v
```

## Development (without Docker)

```bash
# Backend
cd be-jual-hp
npm install
npm run dev

# Frontend
cd fe-jual-hp
npm install
npm run dev

# Admin
cd admin-jual-hp
npm install
npm run dev
```

## Project Structure

```
jual-hp/
├── docker-compose.yml    # All services
├── be-jual-hp/           # Backend API
├── fe-jual-hp/           # User Frontend
└── admin-jual-hp/        # Admin Panel
```
