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
    
    classDef app fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef db fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef database fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    
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
    
    classDef port fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef env fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    
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
    
    classDef env fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef config fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef db fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    
    class ENV env
    class ConfigModule,DBConfig,AppConfig,JWTConfig config
    class MongoDB,PostgreSQL,MySQL,PortConfig,CORSConfig,JWTSecret,JWTExpiry db
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

