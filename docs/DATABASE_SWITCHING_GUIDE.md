# Database Switching Guide

This template makes it easy to switch between different databases without changing your code. The database abstraction layer handles all the differences.

## Supported Databases

- **MongoDB** (via Mongoose)
- **PostgreSQL** (via TypeORM)
- **MySQL/MariaDB** (via TypeORM)

## How to Switch

### Step 1: Update Environment Variables

Edit your `.env` file and change the `DB_TYPE` and `DATABASE_URI`:

#### MongoDB
```env
DB_TYPE=mongodb
DATABASE_URI=mongodb://localhost:27017/myapp
```

#### PostgreSQL
```env
DB_TYPE=postgresql
DATABASE_URI=postgresql://postgres:password@localhost:5432/myapp
```

#### MySQL
```env
DB_TYPE=mysql
DATABASE_URI=mysql://root:password@localhost:3306/myapp
```

### Step 2: Install Database Driver (if needed)

The template includes all drivers, but if you want to remove unused ones:

```bash
# For MongoDB only
npm uninstall @nestjs/typeorm typeorm pg mysql2

# For PostgreSQL/MySQL only
npm uninstall @nestjs/mongoose mongoose
```

### Step 3: Update Your Models/Schemas

#### For MongoDB (Mongoose)

```typescript
// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// users.module.ts
import { Module } from '@nestjs/common';
import { DbModule } from '@app/db';
import { User, UserSchema } from './user.schema';

@Module({
  imports: [DbModule.forFeatureMongo([{ name: User.name, schema: UserSchema }])],
})
export class UsersModule {}
```

#### For PostgreSQL/MySQL (TypeORM)

```typescript
// user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;
}

// users.module.ts
import { Module } from '@nestjs/common';
import { DbModule } from '@app/db';
import { User } from './user.entity';

@Module({
  imports: [DbModule.forFeatureTypeORM([User])],
})
export class UsersModule {}
```

### Step 4: Update Your Services

#### MongoDB (Mongoose)

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
```

#### PostgreSQL/MySQL (TypeORM)

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
```

## Best Practices

1. **Use Repository Pattern**: Create a repository interface to abstract database operations
2. **Environment Variables**: Always use environment variables for database configuration
3. **Migrations**: Use proper migration tools (TypeORM migrations for SQL, Mongoose migrations for MongoDB)
4. **Connection Pooling**: Configure connection pooling for production
5. **Error Handling**: Handle database-specific errors appropriately

## Troubleshooting

### Connection Issues

1. **Check Database is Running**: Ensure your database server is running
2. **Verify Connection String**: Double-check your `DATABASE_URI` format
3. **Check Credentials**: Verify username/password are correct
4. **Network Access**: Ensure database allows connections from your application

### Type Errors

If you get TypeScript errors after switching:
1. Make sure you've updated your models/schemas
2. Check that you're using the correct decorators (Mongoose vs TypeORM)
3. Verify imports are correct

## Example: Complete Switch from MongoDB to PostgreSQL

1. Update `.env`:
   ```env
   DB_TYPE=postgresql
   DATABASE_URI=postgresql://postgres:password@localhost:5432/myapp
   ```

2. Convert schema to entity:
   ```typescript
   // Before (Mongoose)
   @Schema()
   export class User extends Document {
     @Prop() name: string;
   }

   // After (TypeORM)
   @Entity('users')
   export class User {
     @Column() name: string;
   }
   ```

3. Update module:
   ```typescript
   // Before
   DbModule.forFeatureMongo([{ name: User.name, schema: UserSchema }])

   // After
   DbModule.forFeatureTypeORM([User])
   ```

4. Update service:
   ```typescript
   // Before
   @InjectModel(User.name) private userModel: Model<User>

   // After
   @InjectRepository(User) private userRepository: Repository<User>
   ```

That's it! Your application will now use PostgreSQL instead of MongoDB.

