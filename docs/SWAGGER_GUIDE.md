# Swagger/OpenAPI Documentation Guide

Complete guide to using Swagger in the NestJS monorepo template.

## 🎯 Overview

Swagger is automatically configured using a **single plugin approach** - simple and lightweight. It's enabled in development by default and can be enabled in production if needed.

## 🚀 Quick Start

### Automatic Setup

Swagger is already configured! Just start your app:

```bash
npm run start:dev:api
```

Then visit: `http://localhost:3001/api-docs`

### Configuration

Swagger is automatically enabled in:
- **Development** (`NODE_ENV=development`) ✅
- **Production** (if `ENABLE_SWAGGER=true`) ✅

## ⚙️ Environment Variables

```env
# Swagger Configuration
SWAGGER_TITLE=My API
SWAGGER_DESCRIPTION=API Documentation
SWAGGER_VERSION=1.0
SWAGGER_PATH=api-docs
ENABLE_SWAGGER=false  # Set to true to enable in production
```

## 📝 Usage in Controllers

### Basic Example

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createUserDto: CreateUserDto) {
    // ...
  }
}
```

### DTO Documentation

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'john@example.com',
    required: true,
  })
  @IsEmail()
  email: string;
}
```

### Authentication

```typescript
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@Controller('protected')
export class ProtectedController {
  // Protected endpoints
}
```

## 🔧 Advanced Configuration

### Custom Swagger Setup

The `setupSwagger()` function is already configured, but you can customize it:

```typescript
// apps/api-server/src/main.ts
import { setupSwagger } from '@app/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Custom Swagger setup
  setupSwagger(app);
  
  await app.listen(3000);
}
```

### Multiple API Versions

```typescript
// In swagger.config.ts, you can add versioning:
.addApiKey({ type: 'apiKey', in: 'header', name: 'X-API-Version' }, 'api-version')
```

## 📋 Available Decorators

### Controller Decorators
- `@ApiTags('tag-name')` - Group endpoints
- `@ApiBearerAuth('JWT-auth')` - Require JWT authentication
- `@ApiSecurity('api-key')` - Require API key

### Method Decorators
- `@ApiOperation({ summary: '...' })` - Endpoint description
- `@ApiResponse({ status: 200, description: '...' })` - Response documentation
- `@ApiParam({ name: 'id', type: 'string' })` - Path parameter
- `@ApiQuery({ name: 'page', required: false })` - Query parameter
- `@ApiBody({ type: CreateUserDto })` - Request body

### Property Decorators
- `@ApiProperty({ description: '...', example: '...' })` - Property documentation

## 🎨 Best Practices

### 1. **Use Tags**
Group related endpoints:
```typescript
@ApiTags('users')
@Controller('users')
```

### 2. **Document All Responses**
```typescript
@ApiResponse({ status: 200, description: 'Success' })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 404, description: 'Not found' })
```

### 3. **Provide Examples**
```typescript
@ApiProperty({
  example: 'john@example.com',
  description: 'User email address',
})
```

### 4. **Document Authentication**
```typescript
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
```

## 🔒 Production Considerations

### Security

1. **Disable in Production** (default):
   ```env
   NODE_ENV=production
   # Swagger is automatically disabled
   ```

2. **Enable if Needed**:
   ```env
   NODE_ENV=production
   ENABLE_SWAGGER=true
   ```

3. **Protect Swagger Endpoint**:
   - Use authentication
   - Restrict by IP
   - Use different path

### Performance

- Swagger UI is only loaded when enabled
- No performance impact when disabled
- Minimal overhead when enabled

## 📊 Swagger UI Features

- **Interactive API Testing**: Test endpoints directly
- **Schema Validation**: See request/response schemas
- **Authentication**: Test with JWT tokens
- **Export**: Download OpenAPI spec

## 🔗 Accessing Swagger

### Development
```
http://localhost:3001/api-docs
```

### Production (if enabled)
```
https://your-domain.com/api-docs
```

## 📚 Related

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)

