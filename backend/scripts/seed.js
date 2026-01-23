require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');
const connectDB = require('../config/database');

/**
 * Database Seeding Script
 * Initializes the database with default roles and admin user
 *
 * Usage: npm run seed
 */

const seedDatabase = async () => {
  try {
    console.log('Starting database seed...');

    // Connect to database
    await connectDB();

    // Clear existing roles
    await Role.deleteMany({});
    console.log('Cleared existing roles');

    // Create roles with permissions
    const customerRole = await Role.create({
      name: 'customer',
      description: 'Regular customer with basic shopping permissions',
      permissions: [
        'read:products',
        'create:orders',
        'read:own_orders',
        'update:own_profile',
      ],
    });

    const adminRole = await Role.create({
      name: 'admin',
      description: 'Administrator with full system access',
      permissions: [
        'read:products',
        'create:products',
        'update:products',
        'delete:products',
        'read:all_orders',
        'update:orders',
        'delete:orders',
        'read:all_users',
        'update:all_users',
        'delete:users',
        'read:audit_logs',
        'create:orders',
        'read:own_orders',
        'update:own_profile',
      ],
    });

    console.log('✓ Created roles: customer, admin');

    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: 'admin@crownhour.com' });

    if (!existingAdmin) {
      // Create default admin user
      await User.create({
        email: 'admin@crownhour.com',
        password: 'Admin@123456', // Change this in production
        firstName: 'Admin',
        lastName: 'User',
        role: adminRole._id,
        isActive: true,
        emailVerified: true,
      });

      console.log('✓ Created default admin user');
      console.log('  Email: admin@crownhour.com');
      console.log('  Password: Admin@123456');
      console.log('  ⚠️  IMPORTANT: Change the admin password immediately!');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Create a sample customer for testing (optional)
    const existingCustomer = await User.findOne({ email: 'customer@example.com' });

    if (!existingCustomer) {
      await User.create({
        email: 'customer@example.com',
        password: 'Customer@123456',
        firstName: 'Test',
        lastName: 'Customer',
        role: customerRole._id,
        isActive: true,
        emailVerified: true,
      });

      console.log('✓ Created test customer user');
      console.log('  Email: customer@example.com');
      console.log('  Password: Customer@123456');
    } else {
      console.log('✓ Test customer already exists');
    }

    console.log('\n✓ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
