const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPasswords() {
  try {
    console.log('🔧 Fixing user passwords...');
    
    // Password yang akan digunakan (sama dengan create-secure-users.js)
    const passwords = {
      admin: 'Admin@2024!',
      manager: 'Manager@2024!', 
      standardization: 'ayamgoreng'
    };

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
  } finally {
    await prisma.$disconnect();
  }
}

fixPasswords();