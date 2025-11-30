# Admin Seeding Guide

Guide to the admin seeding functionality included in the admin app.

## 🎯 Overview

The admin app includes automatic admin user seeding on startup. This creates a default admin user if no admin exists in the database.

## 🚀 How It Works

### Automatic Seeding

When the admin app starts, it automatically:
1. Checks if an admin user exists
2. If no admin exists, creates a default admin
3. Logs the credentials (only on first creation)

### Default Credentials

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_ROLE=super_admin
```

## ⚙️ Configuration

### Environment Variables

Add to your `.env` file:

```env
# Admin Seeding
SEED_ADMIN=true                    # Enable/disable seeding (default: true)
ADMIN_EMAIL=admin@example.com      # Default admin email
ADMIN_PASSWORD=admin123            # Default admin password
ADMIN_ROLE=super_admin             # Default admin role
```

### Disable Seeding

To disable automatic seeding:

```env
SEED_ADMIN=false
```

## 📋 Admin Schema

### MongoDB Version

```typescript
{
  email: string;           // Unique, required
  password: string;        // Hashed with bcrypt
  role: string;           // 'admin', 'super_admin', 'moderator'
  isActive: boolean;      // Account status
  lastLoginAt?: Date;     // Last login timestamp
  lastLoginIp?: string;   // Last login IP
  name?: string;          // Admin name
  avatar?: string;        // Avatar URL
}
```

### TypeORM Version

Same structure, works with PostgreSQL and MySQL.

## 🔐 Security Notes

### Password Hashing

Passwords are automatically hashed using `bcryptjs` with 10 salt rounds.

### First Login

⚠️ **Important**: Change the default password immediately after first login!

### Production

For production:
1. Set strong default password via `ADMIN_PASSWORD`
2. Disable seeding after first admin is created (`SEED_ADMIN=false`)
3. Use environment-specific credentials

## 📝 Example Usage

### Start Admin App

```bash
npm run start:dev:admin
```

### Expected Output

```
[AdminSeedService] ✅ Default admin user created successfully
[AdminSeedService] 📧 Email: admin@example.com
[AdminSeedService] 🔑 Password: admin123
[AdminSeedService] ⚠️  Please change the default password after first login!
```

### Subsequent Starts

```
[AdminSeedService] Admin user already exists, skipping seed
```

## 🔧 Customization

### Custom Admin Schema

Edit `apps/admin/src/admin/schemas/admin.schema.ts` to add fields:

```typescript
@Prop()
phoneNumber?: string;

@Prop()
department?: string;
```

### Custom Seeding Logic

Edit `apps/admin/src/admin/services/admin-seed.service.ts`:

```typescript
// Add multiple admins
const admins = [
  { email: 'admin@example.com', role: 'super_admin' },
  { email: 'moderator@example.com', role: 'moderator' },
];

for (const adminData of admins) {
  // ... create admin
}
```

## 🎯 Production Checklist

- [ ] Set strong `ADMIN_PASSWORD` in production `.env`
- [ ] Use unique `ADMIN_EMAIL` for production
- [ ] Disable seeding after first admin (`SEED_ADMIN=false`)
- [ ] Implement password change on first login
- [ ] Add email verification if needed
- [ ] Set up proper role-based access control

## 📚 Related

- [Security Middleware](./SECURITY_MIDDLEWARE.md) - Security features
- [Admin App Documentation](./apps/admin/README.md) - Admin app details

