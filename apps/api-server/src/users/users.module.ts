import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from '@app/db';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { UserEntity } from './entities/user.entity';

/**
 * Users Module
 * 
 * Supports both MongoDB (Mongoose) and TypeORM databases.
 * Automatically selects the correct database implementation based on DB_TYPE.
 */
@Module({})
export class UsersModule {
  static forRoot(): DynamicModule {
    const dbType = (process.env.DB_TYPE || 'mongodb').toLowerCase();
    
    const imports: any[] = [ConfigModule];
    
    // Conditionally import based on database type
    if (dbType === 'mongodb') {
      imports.push(DbModule.forFeatureMongo([{ name: User.name, schema: UserSchema }]));
    } else {
      // TypeORM for PostgreSQL or MySQL
      imports.push(DbModule.forFeatureTypeORM([UserEntity]));
    }

    return {
      module: UsersModule,
      imports,
      controllers: [UsersController],
      providers: [UsersService],
      exports: [UsersService],
    };
  }
}

