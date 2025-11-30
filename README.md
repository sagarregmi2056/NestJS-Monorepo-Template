# NestJS Monorepo Template

A professional, production-ready NestJS monorepo template with flexible database abstraction, shared libraries, and best practices.

## 🏗️ Architecture

### Overview

This monorepo follows a **microservices architecture** where each application is independent but shares common libraries. This design allows:

- ✅ **Independent Deployment** - Deploy apps separately
- ✅ **Code Reusability** - Shared libraries prevent duplication
- ✅ **Scalability** - Scale each service independently
- ✅ **Flexibility** - Easy to add/remove services

### Architecture Diagram

```mermaid
flowchart TB
    subgraph Root["📦 nestjs-monorepo-template/"]
        direction TB
        
        subgraph Apps["📱 apps/ (Independent Services)"]
            direction TB
            API["api-server<br/>📍 Port 3001<br/>REST API • Validation<br/>Swagger Docs"]
            Worker["worker<br/>⚙️ Background Service<br/>No HTTP Server<br/>Cron Jobs • Queues"]
            WS["websocket-service<br/>📍 Port 3002<br/>Real-time • Socket.IO<br/>Event Broadcasting"]
            Admin["admin<br/>📍 Port 3003<br/>Admin Panel<br/>Swagger Docs"]
        end
        
        subgraph Libs["📚 libs/ (Shared Libraries)"]
            direction TB
            DB["db/<br/>🗄️ Database Abstraction<br/>MongoDB ↔ PostgreSQL ↔ MySQL<br/>Auto-switch via ENV"]
            Config["configuration/<br/>⚙️ Environment Config<br/>Type-safe • Validation<br/>Centralized Settings"]
            Common["common/<br/>🛠️ Utilities<br/>Logging • Errors • Filters<br/>Reusable Services"]
            Security["security/<br/>🔒 Security Middleware<br/>Helmet • Rate Limit<br/>Compression • Logging"]
            Swagger["swagger/<br/>📚 API Documentation<br/>OpenAPI • Interactive UI<br/>Dev & Prod Ready"]
        end
    end

    %% Dependencies
    API -->|uses| DB
    API -->|uses| Config
    API -->|uses| Common
    API -->|uses| Security
    API -->|uses| Swagger
    
    Worker -->|uses| DB
    Worker -->|uses| Config
    Worker -->|uses| Common
    
    WS -->|uses| DB
    WS -->|uses| Config
    WS -->|uses| Common
    
    Admin -->|uses| DB
    Admin -->|uses| Config
    Admin -->|uses| Common
    Admin -->|uses| Security
    Admin -->|uses| Swagger

    %% Styling
    classDef app fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#000,font-weight:bold
    classDef lib fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px,color:#000,font-weight:bold
    
    class API,Worker,WS,Admin app
    class DB,Config,Common,Security,Swagger lib
```

### Architecture Layers

#### 1. **Application Layer** (`apps/`)
Independent services that can run separately:

| Application | Purpose | Port | HTTP Server |
|------------|---------|------|-------------|
| **api-server** | Main REST API for clients | 3001 | ✅ Yes |
| **websocket-service** | Real-time WebSocket connections | 3002 | ✅ Yes |
| **admin** | Admin dashboard & management | 3003 | ✅ Yes |
| **worker** | Background jobs & scheduled tasks | N/A | ❌ No |

#### 2. **Library Layer** (`libs/`)
Shared code used across all applications:

| Library | Purpose | Used By |
|---------|---------|---------|
| **db** | Database abstraction (MongoDB/PostgreSQL/MySQL) | All apps |
| **configuration** | Environment-based config management | All apps |
| **common** | Utilities, logging, error handling | All apps |
| **security** | Security middleware (helmet, rate-limit, etc.) | API & Admin |
| **swagger** | API documentation setup | API & Admin |


# Architecture Diagram

Visual representation of the NestJS Monorepo Template architecture.

## 🏗️ Complete Architecture

```mermaid
flowchart TB
    subgraph Root["📦 nestjs-monorepo-template/"]
        direction TB
        
        subgraph Apps["📱 apps/ (Independent Services)"]
            direction TB
            API["api-server<br/>📍 Port 3001<br/>REST API • Validation • Health"]
            Worker["worker<br/>⚙️ Background Service<br/>Scheduled Tasks • No HTTP"]
            WS["websocket-service<br/>📍 Port 3002<br/>Real-time • Socket.IO"]
            Admin["admin<br/>📍 Port 3003<br/>Admin Panel • Management"]
        end
        
        subgraph Libs["📚 libs/ (Shared Reusable Code)"]
            direction TB
            DB["db/<br/>🗄️ Database Abstraction<br/>MongoDB ↔ PostgreSQL ↔ MySQL"]
            Config["configuration/<br/>⚙️ Environment Config<br/>Type-safe • Validation"]
            Common["common/<br/>🛠️ Utilities<br/>Logging • Errors • Filters"]
        end
        
        RootFiles["📄 Root Files<br/>package.json • tsconfig.json<br/>nest-cli.json • .env"]
    end

    %% Dependencies - All apps use all libs
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
    classDef root fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000
    
    class API,Worker,WS,Admin app
    class DB,Config,Common lib
    class RootFiles root
```

## 🔄 Data Flow

```mermaid
flowchart LR
    subgraph Client["👤 Client"]
        Browser["Browser"]
        Mobile["Mobile App"]
        AdminUI["Admin UI"]
    end
    
    subgraph Services["🚀 Services"]
        API["api-server<br/>:3001"]
        WS["websocket-service<br/>:3002"]
        Admin["admin<br/>:3003"]
    end
    
    subgraph Worker["⚙️ Background"]
        WorkerService["worker<br/>(No Port)"]
    end
    
    subgraph Database["💾 Database"]
        MongoDB["MongoDB"]
        PostgreSQL["PostgreSQL"]
        MySQL["MySQL"]
    end
    
    Browser -->|HTTP/REST| API
    Mobile -->|HTTP/REST| API
    Browser -->|WebSocket| WS
    AdminUI -->|HTTP/REST| Admin
    
    API -->|Read/Write| Database
    WS -->|Read/Write| Database
    Admin -->|Read/Write| Database
    WorkerService -->|Read/Write| Database
    
    API -.->|Events| WS
    WorkerService -.->|Process| API
```

## 📦 Dependency Graph

```mermaid
graph TD
    subgraph Applications["Applications"]
        A[api-server]
        W[worker]
        WS[websocket-service]
        AD[admin]
    end
    
    subgraph Libraries["Shared Libraries"]
        DB[db<br/>Database Abstraction]
        CFG[configuration<br/>Config Management]
        COM[common<br/>Utilities]
    end
    
    A --> DB
    A --> CFG
    A --> COM
    
    W --> DB
    W --> CFG
    W --> COM
    
    WS --> DB
    WS --> CFG
    WS --> COM
    
    AD --> DB
    AD --> CFG
    AD --> COM
    
    classDef app fill:#2563eb,color:white,stroke:#1e40af,stroke-width:2px
    classDef lib fill:#7c3aed,color:white,stroke:#6d28d9,stroke-width:2px
    
    class A,W,WS,AD app
    class DB,CFG,COM lib
```

## 🗄️ Database Abstraction Layer

```mermaid
flowchart TB
    subgraph Apps["Applications"]
        API[api-server]
        WS[websocket-service]
        Admin[admin]
        Worker[worker]
    end
    
    subgraph DBModule["libs/db Module"]
        Factory[DatabaseFactory]
        MongoModule[MongooseModule]
        TypeORMModule[TypeORMModule]
    end
    
    subgraph Databases["Databases"]
        MongoDB[(MongoDB)]
        PostgreSQL[(PostgreSQL)]
        MySQL[(MySQL)]
    end
    
    API --> Factory
    WS --> Factory
    Admin --> Factory
    Worker --> Factory
    
    Factory -->|DB_TYPE=mongodb| MongoModule
    Factory -->|DB_TYPE=postgresql| TypeORMModule
    Factory -->|DB_TYPE=mysql| TypeORMModule
    
    MongoModule --> MongoDB
    TypeORMModule --> PostgreSQL
    TypeORMModule --> MySQL
    
    classDef app fill:#2563eb,color:#fff,stroke:#1e40af,stroke-width:2px
    classDef db fill:#7c3aed,color:#fff,stroke:#6d28d9,stroke-width:2px
    classDef database fill:#059669,color:#fff,stroke:#047857,stroke-width:2px
    
    class API,WS,Admin,Worker app
    class Factory,MongoModule,TypeORMModule db
    class MongoDB,PostgreSQL,MySQL database
```

## 🚀 Deployment Architecture

```mermaid
flowchart TB
    subgraph Production["Production Environment"]
        subgraph LoadBalancer["Load Balancer"]
            LB[NGINX/Cloud Load Balancer]
        end
        
        subgraph APIInstances["API Server Instances"]
            API1[api-server:3001<br/>Instance 1]
            API2[api-server:3001<br/>Instance 2]
            API3[api-server:3001<br/>Instance 3]
        end
        
        subgraph OtherServices["Other Services"]
            WS[websocket-service:3002]
            Admin[admin:3003]
            Worker[worker<br/>Background]
        end
        
        subgraph Database["Database Cluster"]
            Primary[(Primary DB)]
            Replica1[(Replica 1)]
            Replica2[(Replica 2)]
        end
        
        LB --> API1
        LB --> API2
        LB --> API3
        
        API1 --> Primary
        API2 --> Primary
        API3 --> Primary
        
        WS --> Replica1
        Admin --> Replica2
        Worker --> Primary
        
        Primary -.->|Replication| Replica1
        Primary -.->|Replication| Replica2
    end
    
    classDef lb fill:#4caf50,color:white,stroke:#2e7d32,stroke-width:2px
    classDef api fill:#2196f3,color:white,stroke:#1565c0,stroke-width:2px
    classDef service fill:#9c27b0,color:white,stroke:#6a1b9a,stroke-width:2px
    classDef db fill:#ff9800,color:white,stroke:#e65100,stroke-width:2px
    
    class LB lb
    class API1,API2,API3 api
    class WS,Admin,Worker service
    class Primary,Replica1,Replica2 db
```

## 📊 Port Configuration

```mermaid
flowchart LR
    subgraph Ports["Port Configuration"]
        P3001["Port 3001<br/>api-server"]
        P3002["Port 3002<br/>websocket-service"]
        P3003["Port 3003<br/>admin"]
        PNone["No Port<br/>worker"]
    end
    
    subgraph Env["Environment Variables"]
        API_PORT["API_SERVER_PORT=3001"]
        WS_PORT["WEBSOCKET_PORT=3002"]
        ADMIN_PORT["ADMIN_PORT=3003"]
    end
    
    API_PORT --> P3001
    WS_PORT --> P3002
    ADMIN_PORT --> P3003
    
    classDef port fill:#2563eb,color:#fff,stroke:#1e40af,stroke-width:2px
    classDef env fill:#7c3aed,color:#fff,stroke:#6d28d9,stroke-width:2px
    
    class P3001,P3002,P3003,PNone port
    class API_PORT,WS_PORT,ADMIN_PORT env
```

## 🔧 Configuration Flow

```mermaid
flowchart TD
    ENV[.env file] --> ConfigModule[ConfigModule]
    
    ConfigModule --> DBConfig[database.config.ts]
    ConfigModule --> AppConfig[app.config.ts]
    ConfigModule --> JWTConfig[jwt.config.ts]
    
    DBConfig --> DBType{DB_TYPE?}
    DBType -->|mongodb| MongoDB[MongoDB Connection]
    DBType -->|postgresql| PostgreSQL[PostgreSQL Connection]
    DBType -->|mysql| MySQL[MySQL Connection]
    
    AppConfig --> PortConfig[Port Configuration]
    AppConfig --> CORSConfig[CORS Configuration]
    
    JWTConfig --> JWTSecret[JWT Secret]
    JWTConfig --> JWTExpiry[JWT Expiry]
    
    classDef env fill:#f59e0b,color:#fff,stroke:#d97706,stroke-width:2px
    classDef config fill:#7c3aed,color:#fff,stroke:#6d28d9,stroke-width:2px
    classDef db fill:#2563eb,color:#fff,stroke:#1e40af,stroke-width:2px
    classDef connection fill:#059669,color:#fff,stroke:#047857,stroke-width:2px
    
    class ENV env
    class ConfigModule,DBConfig,AppConfig,JWTConfig config
    class PortConfig,CORSConfig,JWTSecret,JWTExpiry db
    class MongoDB,PostgreSQL,MySQL connection
```

## 📝 How to View These Diagrams

1. **GitHub**: These diagrams will render automatically in GitHub markdown
2. **VS Code**: Install "Markdown Preview Mermaid Support" extension
3. **Online**: Copy the mermaid code to [mermaid.live](https://mermaid.live)
4. **Documentation**: Use in your documentation site (Docusaurus, GitBook, etc.)

## 🎨 Diagram Legend

- **Blue boxes**: Applications (apps/)
- **Purple boxes**: Shared libraries (libs/)
- **Orange boxes**: Configuration/Root files
- **Green boxes**: Infrastructure/Deployment
- **Arrows**: Dependencies/Data flow

## 📚 Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture explanation
- [README.md](./README.md) - Main documentation
- [PORT_CONFIGURATION.md](./PORT_CONFIGURATION.md) - Port setup guide





### Data Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────┐     ┌──────────────┐     ┌──────────┐
│  api-server     │────▶│  libs/db     │────▶│ Database │
│  (Port 3001)    │     │  (Abstraction)│     │          │
└─────────────────┘     └──────────────┘     └──────────┘
       │
       │ WebSocket Event
       ▼
┌─────────────────┐     ┌──────────────┐
│ websocket-svc   │────▶│  libs/db     │
│  (Port 3002)    │     │  (Read Data) │
└─────────────────┘     └──────────────┘
       │
       │ Broadcast
       ▼
┌─────────────┐
│   Clients   │
└─────────────┘

┌─────────────┐
│   Worker    │────▶│  libs/db     │────▶│ Database │
│ (Background)│     │  (Process)   │     │          │
└─────────────┘     └──────────────┘     └──────────┘
```

### Key Design Principles

1. **Separation of Concerns**
   - Each app has a single responsibility
   - Apps communicate via shared database or events
   - No direct app-to-app dependencies

2. **Code Reusability**
   - Common logic lives in `libs/`
   - Import libraries: `import { DbModule } from '@app/db'`
   - No code duplication across apps

3. **Database Abstraction**
   - Switch databases via `DB_TYPE` environment variable
   - No code changes needed
   - Supports MongoDB, PostgreSQL, MySQL

4. **Configuration Management**
   - Centralized in `libs/configuration`
   - Type-safe config objects
   - Environment-based values

5. **Security by Default**
   - Security middleware in `libs/security`
   - Applied automatically to HTTP servers
   - Rate limiting, helmet, compression

📊 **More Diagrams**: See [docs/ARCHITECTURE_DIAGRAM.md](./docs/ARCHITECTURE_DIAGRAM.md) for detailed architecture diagrams.

## 📁 Project Structure

```
nestjs-monorepo-template/
├── apps/                          # 📱 Independent Applications
│   ├── api-server/               # REST API (Port 3001)
│   │   ├── src/
│   │   │   ├── main.ts           # Bootstrap & Swagger setup
│   │   │   ├── app.module.ts     # Root module
│   │   │   ├── users/            # Feature module example
│   │   │   └── health/           # Health check endpoint
│   │   └── tsconfig.app.json
│   │
│   ├── worker/                   # Background Worker (No HTTP)
│   │   ├── src/
│   │   │   ├── main.ts           # Application context (no HTTP)
│   │   │   ├── app.module.ts
│   │   │   └── tasks/            # Scheduled tasks & cron jobs
│   │   └── tsconfig.app.json
│   │
│   ├── websocket-service/        # WebSocket Service (Port 3002)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   └── gateway/          # Socket.IO gateway
│   │   └── tsconfig.app.json
│   │
│   └── admin/                     # Admin Panel (Port 3003)
│       ├── src/
│       │   ├── main.ts           # Bootstrap & Swagger setup
│       │   ├── app.module.ts
│       │   └── admin/             # Admin features
│       └── tsconfig.app.json
│
├── libs/                          # 📚 Shared Libraries
│   ├── db/                        # Database Abstraction
│   │   ├── src/
│   │   │   ├── db.module.ts      # Main module (auto-selects DB)
│   │   │   ├── mongodb/          # MongoDB implementation
│   │   │   ├── postgresql/       # PostgreSQL implementation
│   │   │   └── mysql/            # MySQL implementation
│   │   └── tsconfig.lib.json
│   │
│   ├── configuration/             # Configuration Management
│   │   ├── src/
│   │   │   ├── database.config.ts # DB config
│   │   │   ├── app.config.ts      # App config
│   │   │   └── jwt.config.ts      # JWT config
│   │   └── tsconfig.lib.json
│   │
│   ├── common/                    # Common Utilities
│   │   ├── src/
│   │   │   ├── filters/          # Exception filters
│   │   │   ├── interceptors/     # Interceptors
│   │   │   └── services/         # Shared services
│   │   └── tsconfig.lib.json
│   │
│   ├── security/                  # Security Middleware
│   │   ├── src/
│   │   │   ├── security.module.ts
│   │   │   └── middleware/       # Helmet, Rate Limit, etc.
│   │   └── tsconfig.lib.json
│   │
│   └── swagger/                   # Swagger/OpenAPI
│       ├── src/
│       │   └── swagger.config.ts  # Swagger setup function
│       └── tsconfig.lib.json
│
├── docs/                          # 📖 Documentation
│   ├── README.md                  # Documentation index
│   ├── ARCHITECTURE.md            # Detailed architecture
│   ├── QUICK_START.md             # Getting started
│   └── ...                        # More docs
│
├── package.json                   # Root dependencies & scripts
├── tsconfig.json                  # Root TypeScript config
├── nest-cli.json                  # NestJS CLI config
├── .env.example                   # Environment variables template
└── README.md                      # This file
```

### How Apps Communicate

```
┌─────────────────────────────────────────────────────────────┐
│                    Communication Patterns                    │
└─────────────────────────────────────────────────────────────┘

1. Client → API Server (HTTP)
   Client → HTTP Request → api-server → Database

2. API Server → WebSocket Service (Database Events)
   Database Change → api-server → websocket-service → Clients

3. Worker → Database (Scheduled Tasks)
   Cron Job → worker → Database → Process Data

4. Admin → Database (Management)
   Admin Panel → admin → Database → View/Update Data

All apps share the same database but are independent services.
```

📊 **Visual Architecture Diagram**: See [docs/ARCHITECTURE_DIAGRAM.md](./docs/ARCHITECTURE_DIAGRAM.md) for interactive diagrams.

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

## 🔧 Extending the Architecture

### Adding a New Application

1. **Create app directory:**
   ```bash
   mkdir -p apps/my-new-app/src
   ```

2. **Add to `nest-cli.json`:**
   ```json
   {
     "projects": {
       "my-new-app": {
         "type": "application",
         "root": "apps/my-new-app",
         "sourceRoot": "apps/my-new-app/src"
       }
     }
   }
   ```

3. **Create `main.ts`:**
   ```typescript
   import { NestFactory } from '@nestjs/core';
   import { AppModule } from './app.module';
   import { setupSwagger } from '@app/swagger'; // Optional

   async function bootstrap() {
     const app = await NestFactory.create(AppModule);
     setupSwagger(app); // Optional
     await app.listen(3004);
   }
   bootstrap();
   ```

4. **Import shared libraries:**
   ```typescript
   import { DbModule } from '@app/db';
   import { ConfigModule } from '@nestjs/config';
   ```

### Adding a New Shared Library

1. **Create library directory:**
   ```bash
   mkdir -p libs/my-library/src
   ```

2. **Add to `nest-cli.json`:**
   ```json
   {
     "projects": {
       "my-library": {
         "type": "library",
         "root": "libs/my-library",
         "sourceRoot": "libs/my-library/src"
       }
     }
   }
   ```

3. **Export from library:**
   ```typescript
   // libs/my-library/src/index.ts
   export * from './my-library.module';
   export * from './services';
   ```

4. **Use in apps:**
   ```typescript
   import { MyLibraryModule } from '@app/my-library';
   ```

### Architecture Best Practices

- ✅ **Keep apps independent** - No direct app-to-app dependencies
- ✅ **Share via libraries** - Common code goes in `libs/`
- ✅ **Use database for communication** - Apps communicate via shared DB
- ✅ **Follow naming conventions** - Use kebab-case for directories
- ✅ **Document your additions** - Update README and docs

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

## 🔄 CI/CD Pipeline

This template includes a comprehensive GitHub Actions CI/CD pipeline that runs automatically on every push and pull request.

### Pipeline Overview

```mermaid
flowchart LR
    Start[Code Push/PR] --> Lint[Lint Code]
    Start --> Test[Run Tests]
    Start --> TypeCheck[Type Check]
    Start --> Security[Security Audit]
    
    Lint --> Build{All Pass?}
    Test --> Build
    TypeCheck --> Build
    Security --> Build
    
    Build -->|Yes| Docker[Build & Push Docker]
    Build -->|No| Fail[❌ Fail]
    
    Docker --> GHCR[Push to GHCR]
    GHCR --> Success[✅ Success]
    
    classDef trigger fill:#2563eb,color:#fff,stroke:#1e40af,stroke-width:2px
    classDef check fill:#7c3aed,color:#fff,stroke:#6d28d9,stroke-width:2px
    classDef build fill:#059669,color:#fff,stroke:#047857,stroke-width:2px
    classDef registry fill:#f59e0b,color:#fff,stroke:#d97706,stroke-width:2px
    classDef success fill:#10b981,color:#fff,stroke:#059669,stroke-width:2px
    classDef fail fill:#ef4444,color:#fff,stroke:#dc2626,stroke-width:2px
    
    class Start trigger
    class Lint,Test,TypeCheck,Security check
    class Build,Docker build
    class GHCR registry
    class Success success
    class Fail fail
```

### Pipeline Jobs

| Job | Description | Runs On |
|-----|-------------|---------|
| **Lint** | ESLint code quality checks | Node 20 |
| **Test** | Unit & E2E tests with coverage | Node 18 & 20 |
| **Build** | Compile all applications | Node 20 |
| **Docker** | Build & push Docker images to GHCR | Node 20 (main/develop only) |
| **Security** | npm audit for vulnerabilities | Node 20 |
| **Type Check** | TypeScript compilation check | Node 20 |

### Pipeline Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant CI as CI Pipeline
    participant GHCR as GitHub Container Registry
    
    Dev->>GH: Push Code / Create PR
    GH->>CI: Trigger Pipeline
    
    par Parallel Jobs
        CI->>CI: Lint Code
        CI->>CI: Run Tests (Node 18 & 20)
        CI->>CI: Type Check
        CI->>CI: Security Audit
    end
    
    CI->>CI: Build Applications
    alt All Checks Pass
        CI->>CI: Build Docker Image
        CI->>GHCR: Push to ghcr.io (main/develop)
        GHCR-->>CI: Image Published
        CI->>GH: ✅ Pipeline Success
    else Checks Fail
        CI->>GH: ❌ Pipeline Failed
        GH->>Dev: Notify Developer
    end
```

### CI/CD Features

- ✅ **Automated Testing** - Runs on Node.js 18 & 20
- ✅ **Code Quality** - ESLint checks on every commit
- ✅ **Type Safety** - TypeScript compilation verification
- ✅ **Security** - npm audit for vulnerabilities
- ✅ **Coverage Reports** - Code coverage with Codecov integration
- ✅ **Docker Builds** - Automatic Docker image building
- ✅ **Container Registry** - Automatic push to GitHub Container Registry (GHCR)
- ✅ **Multi-Node Testing** - Tests on multiple Node.js versions

### Pipeline Status Badge

Add this to your README to show pipeline status:

```markdown
![CI/CD Pipeline](https://github.com/sagarregmi2056/nestjs-monorepo-template/workflows/CI%2FCD%20Pipeline/badge.svg)
```

### Configuration

The CI/CD pipeline is configured in `.github/workflows/ci.yml`. Key features:

- **Triggers**: Push to `main`/`develop` or Pull Requests
- **Caching**: npm cache for faster builds
- **Matrix Strategy**: Tests on multiple Node.js versions
- **Conditional Docker**: Only builds and pushes on main/develop branches
- **Container Registry**: Automatically pushes to GitHub Container Registry (GHCR)
  - Image location: `ghcr.io/your-username/nestjs-monorepo-template:latest`
  - Access: View packages in your GitHub repository's Packages section
  - Pull command: `docker pull ghcr.io/your-username/nestjs-monorepo-template:latest`

### Local Testing

Test the pipeline locally before pushing:

```bash
# Run lint
npm run lint

# Run tests
npm run test

# Run type check
npx tsc --noEmit

# Run security audit
npm audit
```

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

## 👤 Author

**Sagar Regmi**

- LinkedIn: [sagar-regmi-60b377216](https://www.linkedin.com/in/sagar-regmi-60b377216/)

## 📄 License

MIT

