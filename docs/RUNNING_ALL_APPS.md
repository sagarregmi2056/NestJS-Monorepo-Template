# Running All Apps at Once

This guide shows you how to run all applications simultaneously in the monorepo.

## 🚀 Method 1: Using Concurrently (Recommended)

### Install Concurrently

```bash
npm install --save-dev concurrently
```

### Run All Apps

```bash
npm run start:dev:all
```

This will start:
- ✅ **API Server** (Port 3001) - Blue
- ✅ **WebSocket Service** (Port 3002) - Green  
- ✅ **Admin Panel** (Port 3003) - Yellow
- ✅ **Worker** (Background) - Red

### What You'll See

```
[API] 🚀 Application is running on: http://localhost:3001/api
[WS] 🚀 WebSocket service is running on: http://localhost:3002
[ADMIN] 🚀 Admin panel is running on: http://localhost:3003/admin
[WORKER] 🚀 Worker service is running...
```

### Stop All Apps

Press `Ctrl+C` once to stop all apps gracefully.

## 🎯 Method 2: Separate Terminals (Manual)

Open 4 separate terminals:

### Terminal 1 - API Server
```bash
npm run start:dev:api
```

### Terminal 2 - WebSocket Service
```bash
npm run start:dev:ws
```

### Terminal 3 - Admin Panel
```bash
npm run start:dev:admin
```

### Terminal 4 - Worker
```bash
npm run start:dev:worker
```

**Pros:**
- ✅ Better for debugging (see logs separately)
- ✅ Can restart individual apps
- ✅ Clear separation

**Cons:**
- ❌ Need to manage multiple terminals
- ❌ More manual work

## 🔧 Method 3: Custom Script (Advanced)

Create a custom script file:

### Windows (`start-all.bat`)

```batch
@echo off
echo Starting all apps...
start "API Server" cmd /k "npm run start:dev:api"
start "WebSocket" cmd /k "npm run start:dev:ws"
start "Admin" cmd /k "npm run start:dev:admin"
start "Worker" cmd /k "npm run start:dev:worker"
echo All apps started in separate windows
```

### Linux/Mac (`start-all.sh`)

```bash
#!/bin/bash
echo "Starting all apps..."

# Start in background
npm run start:dev:api &
npm run start:dev:ws &
npm run start:dev:admin &
npm run start:dev:worker &

echo "All apps started!"
echo "Press Ctrl+C to stop all"

# Wait for all background processes
wait
```

Usage:
```bash
chmod +x start-all.sh
./start-all.sh
```

## 📋 Method 4: Using PM2 (Production-like)

### Install PM2

```bash
npm install -g pm2
```

### Create `ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      name: 'api-server',
      script: 'npm',
      args: 'run start:dev:api',
      cwd: './',
      watch: false,
    },
    {
      name: 'websocket-service',
      script: 'npm',
      args: 'run start:dev:ws',
      cwd: './',
      watch: false,
    },
    {
      name: 'admin',
      script: 'npm',
      args: 'run start:dev:admin',
      cwd: './',
      watch: false,
    },
    {
      name: 'worker',
      script: 'npm',
      args: 'run start:dev:worker',
      cwd: './',
      watch: false,
    },
  ],
};
```

### Run with PM2

```bash
pm2 start ecosystem.config.js
pm2 logs                    # View all logs
pm2 monit                   # Monitor dashboard
pm2 stop all                # Stop all
pm2 delete all              # Remove all
```

## 🎨 Customizing Concurrently Output

You can customize the `start:dev:all` script in `package.json`:

```json
{
  "scripts": {
    "start:dev:all": "concurrently \"npm run start:dev:api\" \"npm run start:dev:ws\" \"npm run start:dev:admin\" \"npm run start:dev:worker\" --names \"API,WS,ADMIN,WORKER\" --prefix-colors \"blue,green,yellow,red\" --prefix \"[{name}]\""
  }
}
```

### Options:
- `--names`: Custom names for each process
- `--prefix-colors`: Colors for each process
- `--prefix`: Prefix format
- `--kill-others`: Kill all if one exits
- `--kill-others-on-fail`: Kill all if one fails

## 🔍 Checking All Apps Are Running

### Check Ports

**Windows:**
```bash
netstat -ano | findstr "3001 3002 3003"
```

**Linux/Mac:**
```bash
lsof -i :3001 -i :3002 -i :3003
```

### Test Endpoints

```bash
# API Server
curl http://localhost:3001/api/health

# WebSocket (check if server is running)
curl http://localhost:3002

# Admin Panel
curl http://localhost:3003/admin/health
```

## 🐛 Troubleshooting

### Port Already in Use

If you get port conflicts:

1. **Kill processes on ports:**
   ```bash
   # Windows
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -ti:3001 | xargs kill -9
   ```

2. **Change ports in `.env`:**
   ```env
   API_SERVER_PORT=3001
   WEBSOCKET_PORT=3002
   ADMIN_PORT=3003
   ```

### Apps Not Starting

1. **Check logs** - Each app shows its own logs
2. **Verify database** - Ensure database is running
3. **Check `.env`** - Verify all environment variables

### Concurrently Not Found

```bash
npm install --save-dev concurrently
```

## 📊 Port Summary

Based on your configuration:

| App | Port | URL |
|-----|------|-----|
| API Server | 3001 | http://localhost:3001/api |
| WebSocket | 3002 | ws://localhost:3002 |
| Admin | 3003 | http://localhost:3003/admin |
| Worker | N/A | Background service |

## 💡 Best Practices

1. **Development**: Use `npm run start:dev:all` (concurrently)
2. **Debugging**: Use separate terminals for better log visibility
3. **Production**: Use PM2 or Docker Compose
4. **CI/CD**: Use separate processes or containers

## 🎯 Quick Start

```bash
# Install concurrently (if not already installed)
npm install --save-dev concurrently

# Run all apps
npm run start:dev:all

# Stop all (Ctrl+C)
```

That's it! All your apps are now running simultaneously! 🚀

