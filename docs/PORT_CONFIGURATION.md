# Port Configuration Guide

This guide explains how ports are configured for different apps in the monorepo.

## 🎯 Current Port Setup

| App | Default Port | Environment Variable |
|-----|-------------|---------------------|
| **api-server** | 3000 | `API_SERVER_PORT` or `PORT` |
| **websocket-service** | 3001 | `WEBSOCKET_PORT` or `PORT` |
| **admin** | 3002 | `ADMIN_PORT` or `PORT` |
| **worker** | N/A (no HTTP server) | N/A |

## 📝 How It Works

Each app can run on its own port independently. The configuration system automatically detects which app is running and uses the appropriate port.

### Method 1: App-Specific Environment Variables (Recommended)

```env
# .env file
API_SERVER_PORT=3000
WEBSOCKET_PORT=3001
ADMIN_PORT=3002
```

### Method 2: Global PORT with Overrides

```env
# .env file
PORT=5001                    # Default for all apps
API_SERVER_PORT=3000         # Override for api-server
WEBSOCKET_PORT=3001          # Override for websocket-service
ADMIN_PORT=3002              # Override for admin
```

### Method 3: Hardcoded in main.ts (Not Recommended)

You can also hardcode ports in each app's `main.ts`:

```typescript
// apps/api-server/src/main.ts
const port = 3000; // Hardcoded
await app.listen(port);
```

## 🚀 Running Multiple Apps

### Option 1: Separate Terminals

```bash
# Terminal 1 - API Server (Port 3000)
npm run start:dev:api

# Terminal 2 - WebSocket Service (Port 3001)
npm run start:dev:ws

# Terminal 3 - Admin (Port 3002)
npm run start:dev:admin
```

### Option 2: Using Environment Variables

```bash
# Start API server on port 5000
API_SERVER_PORT=5000 npm run start:dev:api

# Start WebSocket on port 5001
WEBSOCKET_PORT=5001 npm run start:dev:ws

# Start Admin on port 5002
ADMIN_PORT=5002 npm run start:dev:admin
```

## ➕ Adding a New App (e.g., Admin)

### Step 1: Create the App

```bash
cd nestjs-monorepo-template
nest g app admin
```

### Step 2: Configure Port in main.ts

```typescript
// apps/admin/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Get port from config (supports ADMIN_PORT or PORT)
  const port = configService.get<number>('app.port') || 3002;
  await app.listen(port);

  console.log(`🚀 Admin panel running on: http://localhost:${port}`);
}

bootstrap();
```

### Step 3: Add to nest-cli.json

```json
{
  "projects": {
    "admin": {
      "type": "application",
      "root": "apps/admin",
      "entryFile": "main",
      "sourceRoot": "apps/admin/src",
      "compilerOptions": {
        "tsConfigPath": "apps/admin/tsconfig.app.json"
      }
    }
  }
}
```

### Step 4: Add Script to package.json

```json
{
  "scripts": {
    "start:dev:admin": "nest start admin --watch"
  }
}
```

### Step 5: Set Port in .env

```env
ADMIN_PORT=3002
```

## 🔧 Configuration Priority

Port selection follows this priority:

1. **App-specific env var** (e.g., `API_SERVER_PORT`) - ✅ **Highest priority**
2. **Global `PORT` env var** - ⚠️ **Only used if app-specific not set**
3. **Hardcoded default** in `main.ts` - ✅ **Last resort**

### ⚠️ Important: Port Conflicts

**If you set `PORT=5001` without app-specific ports, all apps will try to use 5001 and fail!**

**Solution:** Always set app-specific ports:
```env
API_SERVER_PORT=3000
WEBSOCKET_PORT=3001
ADMIN_PORT=3002
```

See [PORT_CONFLICT_WARNING.md](./PORT_CONFLICT_WARNING.md) for details.

Example:
```env
PORT=5001              # Global default
API_SERVER_PORT=3000   # api-server will use 3000 (overrides PORT)
WEBSOCKET_PORT=3001    # websocket-service will use 3001 (overrides PORT)
ADMIN_PORT=3002        # admin will use 3002 (overrides PORT)
```

## 📋 Example: Complete Setup

### .env file
```env
# Database
DB_TYPE=mongodb
DATABASE_URI=mongodb://localhost:27017/myapp

# App Ports
API_SERVER_PORT=3000
WEBSOCKET_PORT=3001
ADMIN_PORT=3002

# Global config
NODE_ENV=development
API_PREFIX=api
```

### Running All Apps
```bash
# Terminal 1
npm run start:dev:api
# → http://localhost:3000/api

# Terminal 2
npm run start:dev:ws
# → ws://localhost:3001

# Terminal 3
npm run start:dev:admin
# → http://localhost:3002
```

## 🎯 Best Practices

1. **Use app-specific ports**: Set `API_SERVER_PORT`, `WEBSOCKET_PORT`, etc.
2. **Document ports**: Keep a PORT_CONFIGURATION.md file
3. **Avoid conflicts**: Don't use the same port for multiple apps
4. **Use environment variables**: Never hardcode ports in production
5. **Test locally**: Ensure all apps can run simultaneously

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Port Not Respecting Environment Variable

1. Check `.env` file is loaded
2. Verify `ConfigModule` is imported in app module
3. Restart the app after changing `.env`

### Multiple Apps on Same Port

Each app must have a unique port. Check your `.env` file for conflicts.

## 📚 Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall architecture
- [QUICK_START.md](./QUICK_START.md) - Getting started guide

