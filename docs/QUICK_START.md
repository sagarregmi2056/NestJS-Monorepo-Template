# Quick Start Guide

Get your NestJS monorepo up and running in 5 minutes!

## Prerequisites

- Node.js 20+ 
- npm or yarn
- Database (MongoDB, PostgreSQL, or MySQL)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your database connection:

```env
# For MongoDB
DB_TYPE=mongodb
DATABASE_URI=mongodb://localhost:27017/myapp

# OR for PostgreSQL
DB_TYPE=postgresql
DATABASE_URI=postgresql://postgres:password@localhost:5432/myapp

# OR for MySQL
DB_TYPE=mysql
DATABASE_URI=mysql://root:password@localhost:3306/myapp
```

## Step 3: Start Development

```bash
# Start API server
npm run start:dev api-server

# In another terminal, start worker
npm run start:dev worker

# In another terminal, start WebSocket service
npm run start:dev websocket-service
```

## Step 4: Test It Out

### API Server (Port 3000)

```bash
# Health check
curl http://localhost:3000/api/health

# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Get all users
curl http://localhost:3000/api/users
```

### WebSocket Service (Port 3001)

```javascript
// Connect using Socket.IO client
const io = require('socket.io-client');
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected!');
  socket.emit('message', { text: 'Hello!' });
});

socket.on('message', (data) => {
  console.log('Received:', data);
});
```

## Next Steps

1. **Add Your Models**: Create database models in your feature modules
2. **Add Business Logic**: Implement your services
3. **Add Authentication**: Set up JWT authentication
4. **Add Tests**: Write unit and integration tests
5. **Deploy**: Deploy to your preferred platform

## Project Structure

```
apps/
  ├── api-server/          # Main REST API
  ├── worker/              # Background jobs
  └── websocket-service/   # Real-time service

libs/
  ├── db/                  # Database abstraction
  ├── configuration/       # Config management
  └── common/              # Shared utilities
```

## Switching Databases

See [DATABASE_SWITCHING_GUIDE.md](./DATABASE_SWITCHING_GUIDE.md) for detailed instructions.

## Need Help?

- Check the [README.md](./README.md) for detailed documentation
- See [DATABASE_SWITCHING_GUIDE.md](./DATABASE_SWITCHING_GUIDE.md) for database setup
- Review example code in `apps/api-server/src/users/`

Happy coding! 🚀

