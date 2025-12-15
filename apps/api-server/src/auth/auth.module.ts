import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';


/**
 * Auth Module
 * 
 * Provides authentication with pluggable strategies.
 * Currently supports:
 * - JWT authentication
 * 
 * Extensible for additional strategies:
 * - OAuth (Google, GitHub, etc.)
 * - Local strategy
 * - API key strategy
 */
@Module({
  imports: [
    UsersModule.forRoot(), // Import dynamic UsersModule
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtConfigValue = configService.get('jwt') || {};
        return {
          secret: jwtConfigValue.secret || process.env.JWT_SECRET,
          signOptions: {
            expiresIn: jwtConfigValue.expiresIn || '1h',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

