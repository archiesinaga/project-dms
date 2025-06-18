const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Password yang akan digunakan
const passwords = {
  admin: 'ayamgoreng',
  manager: 'ayamgoreng', 
  standardization: 'ayamgoreng'
};

async function createSecureUsers() {
  try {
    console.log('🔧 Creating users with secure passwords...');
    
    // Create Admin user
    const adminPassword = await bcrypt.hash(passwords.admin, 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@company.com' },
      update: {
        password: adminPassword,
        role: 'ADMIN',
        isActive: true
      },
      create: {
        email: 'admin@company.com',
        name: 'Administrator',
        password: adminPassword,
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log('✅ Admin user created/updated');
    
    // Create Manager user
    const managerPassword = await bcrypt.hash(passwords.manager, 12);
    const manager = await prisma.user.upsert({
      where: { email: 'manager@company.com' },
      update: {
        password: managerPassword,
        role: 'MANAGER',
        isActive: true
      },
      create: {
        email: 'manager@company.com',
        name: 'Manager',
        password: managerPassword,
        role: 'MANAGER',
        isActive: true
      }
    });
    console.log('✅ Manager user created/updated');
    
    // Create Standardization user
    const stdPassword = await bcrypt.hash(passwords.standardization, 12);
    const standardization = await prisma.user.upsert({
      where: { email: 'standardization@company.com' },
      update: {
        password: stdPassword,
        role: 'STANDARDIZATION',
        isActive: true
      },
      create: {
        email: 'standardization@company.com',
        name: 'Standardization Officer',
        password: stdPassword,
        role: 'STANDARDIZATION',
        isActive: true
      }
    });
    console.log('✅ Standardization user created/updated');
    
    // Verify users were created
    const allUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['admin@company.com', 'manager@company.com', 'standardization@company.com']
        }
      }
    });
    
    console.log(`📊 Total users in database: ${allUsers.length}`);
    
    console.log('\n✅ Users created/updated successfully with secure passwords:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Admin: admin@company.com`);
    console.log(`🔑 Password: ${passwords.admin}`);
    console.log('');
    console.log(`👤 Manager: manager@company.com`);
    console.log(`🔑 Password: ${passwords.manager}`);
    console.log('');
    console.log(`👤 Standardization: standardization@company.com`);
    console.log(`🔑 Password: ${passwords.standardization}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 Simpan password ini dengan aman!');
    
  } catch (error) {
    console.error('❌ Error creating users:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

async function fixExistingPasswords() {
  try {
    console.log('🔧 Fixing existing user passwords...');
    
    // Update Admin password
    const adminPassword = await bcrypt.hash(passwords.admin, 12);
    const admin = await prisma.user.update({
      where: { email: 'admin@company.com' },
      data: {
        password: adminPassword,
        isActive: true
      }
    });
    console.log('✅ Admin password updated');
    
    // Update Manager password
    const managerPassword = await bcrypt.hash(passwords.manager, 12);
    const manager = await prisma.user.update({
      where: { email: 'manager@company.com' },
      data: {
        password: managerPassword,
        isActive: true
      }
    });
    console.log('✅ Manager password updated');
    
    // Update Standardization password
    const stdPassword = await bcrypt.hash(passwords.standardization, 12);
    const standardization = await prisma.user.update({
      where: { email: 'standardization@company.com' },
      data: {
        password: stdPassword,
        isActive: true
      }
    });
    console.log('✅ Standardization password updated');
    
    console.log('\n✅ All passwords updated successfully:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Admin: admin@company.com`);
    console.log(`🔑 Password: ${passwords.admin}`);
    console.log('');
    console.log(`👤 Manager: manager@company.com`);
    console.log(`🔑 Password: ${passwords.manager}`);
    console.log('');
    console.log(`👤 Standardization: standardization@company.com`);
    console.log(`🔑 Password: ${passwords.standardization}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

async function checkExistingUsers() {
  try {
    console.log('🔍 Checking existing users...');
    
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['admin@company.com', 'manager@company.com', 'standardization@company.com']
        }
      },
      select: {
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    
    if (users.length === 0) {
      console.log('❌ No users found. Run createSecureUsers() first.');
      return;
    }
    
    console.log(`📊 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Active: ${user.isActive}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'create':
      await createSecureUsers();
      break;
    case 'fix':
      await fixExistingPasswords();
      break;
    case 'check':
      await checkExistingUsers();
      break;
    default:
      console.log('�� Available commands:');
      console.log('  node scripts/create-secure-users.js create  - Create/update users');
      console.log('  node scripts/create-secure-users.js fix     - Fix existing passwords');
      console.log('  node scripts/create-secure-users.js check   - Check existing users');
      console.log('');
      console.log('💡 Default: Running createSecureUsers()');
      await createSecureUsers();
  }
}

// Run the script
main().catch(console.error);