# Port Conflict Warning ⚠️

## The Problem

If you set `PORT=5001` in your `.env` file **without** app-specific ports, all apps will try to use port 5001, causing this error:

```
Error: listen EADDRINUSE: address already in use :::5001
```

## ✅ Solution: Use App-Specific Ports

The template is designed to prevent this! Each app checks for its **specific port first**, then falls back to `PORT`.

### Port Priority (for each app):

1. **App-specific port** (e.g., `API_SERVER_PORT`) - ✅ **Highest priority**
2. Global `PORT` - ⚠️ Only used if app-specific port not set
3. Default port (3000, 3001, 3002) - ✅ Last resort

## 📋 Examples

### ❌ BAD: All apps use same port

```env
# .env
PORT=5001
```

**Result:** 
- api-server tries port 5001 ✅ (starts)
- websocket-service tries port 5001 ❌ (ERROR: port in use)
- admin tries port 5001 ❌ (ERROR: port in use)

### ✅ GOOD: Each app has its own port

```env
# .env
PORT=5001                    # Default (won't be used)
API_SERVER_PORT=3000         # api-server uses 3000
WEBSOCKET_PORT=3001         # websocket-service uses 3001
ADMIN_PORT=3002             # admin uses 3002
```

**Result:**
- api-server uses 3000 ✅
- websocket-service uses 3001 ✅
- admin uses 3002 ✅
- All apps run simultaneously! 🎉

### ✅ ALSO GOOD: Only app-specific ports

```env
# .env
API_SERVER_PORT=3000
WEBSOCKET_PORT=3001
ADMIN_PORT=3002
# No PORT variable needed!
```

**Result:** Same as above - each app uses its specific port.

## 🔍 How It Works

Each app's `main.ts` checks ports in this order:

```typescript
// api-server/src/main.ts
const port = parseInt(
  process.env.API_SERVER_PORT ||  // 1. Check app-specific first
  process.env.PORT ||              // 2. Fallback to global PORT
  '3000',                          // 3. Default
  10
);
```

This means:
- If `API_SERVER_PORT` is set → use it (ignores `PORT`)
- If `API_SERVER_PORT` is NOT set → check `PORT`
- If `PORT` is NOT set → use default (3000)

## 🎯 Best Practice

**Always set app-specific ports in `.env`:**

```env
# Recommended .env configuration
API_SERVER_PORT=3000
WEBSOCKET_PORT=3001
ADMIN_PORT=3002

# Optional: Set PORT as a fallback (won't be used if app-specific ports are set)
PORT=5001
```

## 🐛 Troubleshooting

### Error: "Port already in use"

**Cause:** Multiple apps trying to use the same port.

**Solution:**
1. Check your `.env` file
2. Ensure each app has a unique port:
   ```env
   API_SERVER_PORT=3000
   WEBSOCKET_PORT=3001
   ADMIN_PORT=3002
   ```
3. Restart all apps

### Check which ports are in use

**Windows:**
```bash
netstat -ano | findstr :5001
```

**Linux/Mac:**
```bash
lsof -i :5001
```

### Kill process on port

**Windows:**
```bash
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
kill -9 <PID>
```

## 📚 Related

- [PORT_CONFIGURATION.md](./PORT_CONFIGURATION.md) - Complete port configuration guide

