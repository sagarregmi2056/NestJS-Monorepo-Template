# NestJS Monorepo Template

A professional, production-ready NestJS monorepo template with flexible database abstraction, shared libraries, and best practices.

## 🏗️ Architecture

```mermaid
flowchart TB
    subgraph Root["📦 nestjs-monorepo-template/"]
        direction TB
        
        subgraph Apps["📱 apps/ (Independent Services)"]
            direction TB
            API["api-server<br/>📍 Port 3001<br/>REST API • Validation"]
            Worker["worker<br/>⚙️ Background Service<br/>Scheduled Tasks"]
            WS["websocket-service<br/>📍 Port 3002<br/>Real-time • Socket.IO"]
            Admin["admin<br/>📍 Port 3003<br/>Admin Panel"]
        end
        
        subgraph Libs["📚 libs/ (Shared Libraries)"]
            direction TB
            DB["db/<br/>🗄️ Database Abstraction<br/>MongoDB ↔ PostgreSQL ↔ MySQL"]
            Config["configuration/<br/>⚙️ Environment Config<br/>Type-safe • Validation"]
            Common["common/<br/>🛠️ Utilities<br/>Logging • Errors • Filters"]
        end
    end

    %% Dependencies
    API -->|imports| DB
    API -->|imports| Config
    API -->|imports| Common
    
    Worker -->|imports| DB
    Worker -->|imports| Config
    Worker -->|imports| Common
    
    WS -->|imports| DB
    WS -->|imports| Config
    WS -->|imports| Common
    
    Admin -->|imports| DB
    Admin -->|imports| Config
    Admin -->|imports| Common

    %% Styling
    classDef app fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#000,font-weight:bold
    classDef lib fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px,color:#000,font-weight:bold
    
    class API,Worker,WS,Admin app
    class DB,Config,Common lib
```

📊 **More Diagrams**: See [docs/ARCHITECTURE_DIAGRAM.md](./docs/ARCHITECTURE_DIAGRAM.md) for detailed architecture diagrams.

## 📁 Project Structure

```
nestjs-monorepo-template/
├── apps/                          # Applications
│   ├── api-server/               # Main REST API server (Port 3001)
│   ├── worker/                   # Background worker service
│   ├── websocket-service/        # WebSocket/real-time service (Port 3002)
│   └── admin/                    # Admin panel (Port 3003)
│
├── libs/                         # Shared libraries
│   ├── db/                       # Database abstraction layer
│   ├── configuration/            # Configuration management
│   └── common/                   # Common utilities & services
│
├── package.json                  # Root package.json
├── tsconfig.json                 # TypeScript configuration
├── nest-cli.json                 # NestJS CLI configuration
└── README.md                     # This file
```

📊 **Visual Architecture Diagram**: See [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) for interactive diagrams.

## ✨ Features

- ✅ **Monorepo Architecture** - Multiple apps, shared libraries
- ✅ **Database Abstraction** - Easy to switch between MongoDB, PostgreSQL, MySQL
- ✅ **TypeScript** - Full type safety
- ✅ **Configuration Management** - Environment-based config
- ✅ **Shared Libraries** - Reusable code across apps
- ✅ **Best Practices** - Production-ready patterns
- ✅ **Scalable** - Easy to add new apps/services

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Development

```bash
# Start all apps
npm run start:dev

# Start specific app
npm run start:dev api-server      # Port 3000
npm run start:dev worker          # No port (background service)
npm run start:dev websocket-service  # Port 3001
npm run start:dev admin           # Port 3002
```

## 📦 Applications

### **api-server**
Main REST API server for handling HTTP requests.

**Port:** 3001 (configurable via `API_SERVER_PORT`)

**Features:**
- REST API endpoints
- Swagger/OpenAPI documentation (`/api-docs`)
- Authentication/Authorization
- Request validation
- Error handling

### **worker**
Background worker for processing jobs, queues, etc.

**Port:** N/A (no HTTP server - runs in background)

**Features:**
- Scheduled tasks (cron jobs)
- Queue processing
- Background jobs
- Daily cleanup tasks
- Periodic health checks

See [docs/WORKER_EXAMPLES.md](./docs/WORKER_EXAMPLES.md) for detailed examples.

### **websocket-service**
Real-time WebSocket service for live updates.

**Port:** 3001 (configurable via `WEBSOCKET_PORT`)

**Features:**
- WebSocket connections
- Real-time events
- Room-based broadcasting

### **admin**
Admin panel for managing the application.

**Port:** 3003 (configurable via `ADMIN_PORT`)

**Features:**
- Admin dashboard
- Swagger/OpenAPI documentation
- User management
- System configuration
- Health monitoring

## 📚 Shared Libraries

### **libs/db** - Database Abstraction
Switch between databases easily:
- MongoDB (Mongoose)
- PostgreSQL (TypeORM)
- MySQL (TypeORM)

### **libs/configuration** - Config Management
Centralized configuration:
- Environment variables
- Type-safe config
- Validation

### **libs/common** - Common Utilities
Reusable services:
- Logging
- Error handling
- Utilities

### **libs/security** - Security Middleware
Production-ready security middleware:
- Helmet (security headers)
- Compression (response compression)
- Rate Limiting (API protection)
- Request Logging (observability)

See [SECURITY_MIDDLEWARE.md](./SECURITY_MIDDLEWARE.md) for details.

## 🔧 Database Configuration

The template supports multiple databases. Switch easily by changing environment variables:

```env
# MongoDB
DB_TYPE=mongodb
DATABASE_URI=mongodb://localhost:27017/mydb

# PostgreSQL
DB_TYPE=postgresql
DATABASE_URI=postgresql://user:pass@localhost:5432/mydb

# MySQL
DB_TYPE=mysql
DATABASE_URI=mysql://user:pass@localhost:3306/mydb
```

## 📝 Available Scripts

```bash
# Development
npm run start:dev              # Start all apps in dev mode
npm run start:dev:all          # Start all apps at once (recommended)
npm run start:dev:api          # Start API server only
npm run start:dev:ws           # Start WebSocket service only
npm run start:dev:admin        # Start admin panel only
npm run start:dev:worker       # Start worker only

# Build
npm run build                  # Build all apps
npm run build api-server       # Build specific app

# Test
npm run test                   # Run all tests
npm run test:watch             # Watch mode
npm run test:cov               # Coverage

# Lint
npm run lint                   # Lint all code
npm run lint:fix               # Fix linting issues
```

## 🎯 Usage

1. **Clone/Copy this template**
2. **Rename apps** to match your project
3. **Configure database** in `.env`
4. **Add your business logic**
5. **Deploy!**

## 🔌 Port Configuration

Each app runs on its own port:

| App | Default Port | Environment Variable |
|-----|-------------|---------------------|
| api-server | 3001 | `API_SERVER_PORT` |
| websocket-service | 3002 | `WEBSOCKET_PORT` |
| admin | 3003 | `ADMIN_PORT` |

**⚠️ Important:** If you set `PORT=5001` for all apps, you'll get port conflicts! Always use app-specific ports.

**Recommended `.env` setup:**
```env
API_SERVER_PORT=3000
WEBSOCKET_PORT=3001
ADMIN_PORT=3002
```

See [PORT_CONFIGURATION.md](./PORT_CONFIGURATION.md) for detailed guide and [PORT_CONFLICT_WARNING.md](./PORT_CONFLICT_WARNING.md) for conflict prevention.

## 📖 Documentation

All documentation is organized in the [`docs/`](./docs/) folder:

- **[Quick Start Guide](./docs/QUICK_START.md)** - Get started in 5 minutes
- **[Running All Apps](./docs/RUNNING_ALL_APPS.md)** - How to run all apps simultaneously
- **[Security Middleware](./docs/SECURITY_MIDDLEWARE.md)** - Production-ready security middleware guide
- **[Rate Limiting Guide](./docs/RATE_LIMITING_GUIDE.md)** - Selective rate limiting guide
- **[Admin Seeding](./docs/ADMIN_SEEDING.md)** - Admin user seeding guide
- **[Architecture Diagrams](./docs/ARCHITECTURE_DIAGRAM.md)** - Visual architecture diagrams
- **[Architecture Overview](./docs/ARCHITECTURE.md)** - Detailed architecture explanation
- **[Database Switching Guide](./docs/DATABASE_SWITCHING_GUIDE.md)** - How to switch databases
- **[Port Configuration](./docs/PORT_CONFIGURATION.md)** - How to configure ports for each app
- **[Template Features](./docs/TEMPLATE_FEATURES.md)** - Complete feature list
- **[Worker Examples](./docs/WORKER_EXAMPLES.md)** - Worker service examples
- **[Swagger Guide](./docs/SWAGGER_GUIDE.md)** - API documentation guide

## 🔐 Environment Variables

See `.env.example` for all required environment variables.

## 📄 License

MIT

