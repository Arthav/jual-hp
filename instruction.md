# Docker Commands - Jual HP

## Quick Commands

### Start All Services (with rebuild)
```bash
docker-compose up --build
```

### Start All Services (detached mode - runs in background)
```bash
docker-compose up --build -d
```

### Stop All Services
```bash
docker-compose down
```

### Restart a Specific Service
```bash
# Restart frontend only
docker-compose up --build -d frontend

# Restart admin only
docker-compose up --build -d admin

# Restart backend only
docker-compose up --build -d backend
```

### View Running Containers
```bash
docker ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f admin
docker-compose logs -f db
```

### Clean Rebuild (removes volumes and orphan containers)
```bash
docker-compose down -v --remove-orphans
docker-compose up --build
```

---

## Service URLs

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:5173  |
| Admin    | http://localhost:8080  |
| Backend  | http://localhost:3000  |
| Database | localhost:5432         |
