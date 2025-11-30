# Architecture Overview

This document explains the architecture and design decisions of the NestJS Monorepo Template.

## Monorepo Structure

```
nestjs-monorepo-template/
├── apps/                    # Applications (microservices)
│   ├── api-server/         # REST API server
│   ├── worker/             # Background worker
│   └── websocket-service/  # WebSocket service
│
├── libs/                    # Shared libraries
│   ├── db/                 # Database abstraction
│   ├── configuration/      # Configuration management
│   └── common/             # Common utilities
│
└── Configuration files
```

## Design Principles

### 1. **Separation of Concerns**
Each app has a single responsibility:
- **api-server**: Handles HTTP requests/responses
- **worker**: Processes background jobs
- **websocket-service**: Manages real-time connections

### 2. **Code Reusability**
Shared code lives in `libs/`:
- **db**: Database connection logic (switch DBs easily)
- **configuration**: Environment-based configuration
- **common**: Utilities, filters, services

### 3. **Database Abstraction**
The `DbModule` abstracts database connections:
- Switch between MongoDB, PostgreSQL, MySQL via environment variable
- No code changes needed when switching databases
- Supports both Mongoose (MongoDB) and TypeORM (SQL)

## Application Architecture

### API Server

```
api-server/
├── src/
│   ├── main.ts              # Bootstrap
│   ├── app.module.ts       # Root module
│   ├── health/             # Health check endpoint
│   └── users/              # Example feature module
│       ├── users.controller.ts
│       ├── users.service.ts
│       ├── users.module.ts
│       └── dto/
```

**Flow:**
1. Request → Controller
2. Controller → Service
3. Service → Database (via DbModule)
4. Response ← Controller

### Worker

```
worker/
├── src/
│   ├── main.ts              # Bootstrap (no HTTP server)
│   ├── app.module.ts       # Root module
│   └── tasks/              # Scheduled tasks
│       ├── tasks.service.ts
│       └── tasks.module.ts
```

**Flow:**
1. Application starts
2. Scheduled tasks run via `@nestjs/schedule`
3. Background jobs process queues
4. Graceful shutdown on SIGINT

### WebSocket Service

```
websocket-service/
├── src/
│   ├── main.ts              # Bootstrap
│   ├── app.module.ts       # Root module
│   └── events/             # WebSocket events
│       ├── events.gateway.ts
│       └── events.module.ts
```

**Flow:**
1. Client connects via Socket.IO
2. Gateway handles connection/disconnection
3. Events broadcast to connected clients
4. Real-time updates

## Database Abstraction Layer

### How It Works

1. **Configuration**: `DB_TYPE` in `.env` determines database
2. **Factory Pattern**: `DbModule.forRoot()` creates appropriate connection
3. **Unified Interface**: Same module import, different implementation

### Supported Databases

| Database | Driver | ORM/ODM | Module |
|----------|--------|---------|--------|
| MongoDB | Mongoose | Mongoose | `DbModule.forFeatureMongo()` |
| PostgreSQL | pg | TypeORM | `DbModule.forFeatureTypeORM()` |
| MySQL | mysql2 | TypeORM | `DbModule.forFeatureTypeORM()` |

### Usage Example

```typescript
// MongoDB
@Module({
  imports: [DbModule.forFeatureMongo([{ name: User.name, schema: UserSchema }])],
})
export class UsersModule {}

// PostgreSQL/MySQL
@Module({
  imports: [DbModule.forFeatureTypeORM([User])],
})
export class UsersModule {}
```

## Configuration Management

### Structure

```
libs/configuration/
├── src/
│   ├── database.config.ts   # DB configuration
│   ├── app.config.ts       # App configuration
│   └── jwt.config.ts       # JWT configuration
```

### How It Works

1. Environment variables loaded from `.env`
2. Config files use `registerAs()` for namespacing
3. `ConfigModule` loads all configs globally
4. Type-safe access via `ConfigService`

### Example

```typescript
// In service
constructor(private configService: ConfigService) {
  const dbType = this.configService.get<string>('database.type');
  const port = this.configService.get<number>('app.port');
}
```

## Shared Libraries

### Common Library

Provides:
- **LoggerService**: Enhanced logging with context
- **HttpExceptionFilter**: Consistent error responses

### Database Library

Provides:
- **DbModule**: Database connection abstraction
- **DatabaseFactory**: Factory for creating connections

### Configuration Library

Provides:
- **databaseConfig**: Database configuration
- **appConfig**: Application configuration
- **jwtConfig**: JWT configuration

## Best Practices

### 1. **Feature Modules**
Each feature should have its own module:
```
users/
├── users.controller.ts
├── users.service.ts
├── users.module.ts
├── dto/
└── entities/ or schemas/
```

### 2. **DTOs for Validation**
Always use DTOs with `class-validator`:
```typescript
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

### 3. **Service Layer**
Business logic goes in services, not controllers:
```typescript
@Injectable()
export class UsersService {
  async create(dto: CreateUserDto) {
    // Business logic here
  }
}
```

### 4. **Error Handling**
Use global exception filter for consistent errors:
```typescript
app.useGlobalFilters(new HttpExceptionFilter());
```

### 5. **Environment Variables**
Never hardcode values, always use environment variables:
```typescript
const port = configService.get<number>('app.port');
```

## Scaling Considerations

### Horizontal Scaling

1. **Stateless Services**: All apps are stateless
2. **Database**: Use connection pooling
3. **WebSocket**: Use Redis adapter for multi-instance

### Vertical Scaling

1. **Worker**: Add more worker instances for queue processing
2. **API Server**: Load balance multiple instances
3. **WebSocket**: Use Redis adapter for scaling

## Security

1. **Environment Variables**: Never commit `.env`
2. **Validation**: Always validate input with DTOs
3. **CORS**: Configure properly for production
4. **JWT**: Use strong secrets and proper expiration
5. **Database**: Use connection strings with credentials

## Testing Strategy

1. **Unit Tests**: Test services in isolation
2. **Integration Tests**: Test API endpoints
3. **E2E Tests**: Test full flows
4. **Database Tests**: Use test database

## Deployment

### Docker

Each app can be containerized separately:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist ./dist
CMD ["node", "dist/apps/api-server/main"]
```

### Environment

Set environment variables in your deployment platform:
- Database connection
- JWT secrets
- CORS origins
- Ports

## Future Enhancements

- [ ] Redis integration for caching
- [ ] Message queue (Bull/BullMQ)
- [ ] GraphQL support
- [ ] API documentation (Swagger)
- [ ] Monitoring and logging (Winston/Pino)
- [ ] Health checks with detailed status
- [ ] Rate limiting
- [ ] Request logging middleware

