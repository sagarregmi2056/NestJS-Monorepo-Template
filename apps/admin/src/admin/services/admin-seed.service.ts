import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from '../schemas/admin.schema';
import * as bcrypt from 'bcryptjs';

/**
 * Admin Seed Service
 * 
 * Seeds a default admin user on application startup.
 * Only creates admin if no admin exists in the database.
 * 
 * Environment Variables:
 * - ADMIN_EMAIL: Default admin email (default: admin@example.com)
 * - ADMIN_PASSWORD: Default admin password (default: admin123)
 * - ADMIN_ROLE: Default admin role (default: super_admin)
 * - SEED_ADMIN: Enable/disable seeding (default: true)
 */
@Injectable()
export class AdminSeedService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {}

  async onModuleInit() {
    const shouldSeed = process.env.SEED_ADMIN !== 'false';
    
    if (!shouldSeed) {
      this.logger.log('Admin seeding is disabled (SEED_ADMIN=false)');
      return;
    }

    await this.seedAdmin();
  }

  async seedAdmin(): Promise<void> {
    try {
      // Check if admin already exists
      const existingAdmin = await this.adminModel.findOne({
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
      });

      if (existingAdmin) {
        this.logger.log('Admin user already exists, skipping seed');
        return;
      }

      // Create default admin
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const adminRole = process.env.ADMIN_ROLE || 'super_admin';

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

      const admin = new this.adminModel({
        email: adminEmail,
        password: hashedPassword,
        role: adminRole,
        isActive: true,
        name: 'Default Admin',
      });

      await admin.save();

      this.logger.log(`Default admin user created successfully`);
      this.logger.warn(`Email: ${adminEmail}`);
      this.logger.warn(`Password: ${adminPassword}`);
      this.logger.warn(`Please change the default password after first login!`);
    } catch (error) {
      this.logger.error(`Failed to seed admin user: ${error.message}`);
    }
  }
}

