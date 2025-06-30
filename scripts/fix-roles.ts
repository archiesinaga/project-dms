const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUserRoles() {
  try {
    // Update all users with invalid roles to STANDARDIZATION
    await prisma.user.updateMany({
      where: {
        NOT: {
          role: {
            in: ['ADMIN', 'MANAGER', 'STANDARDIZATION']
          }
        }
      },
      data: {
        role: 'STANDARDIZATION'
      }
    });

    console.log('User roles fixed successfully');
  } catch (error) {
    console.error('Error fixing user roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserRoles();