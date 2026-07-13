const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('pratik25', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { role: 'ADMIN', passwordHash: hash, mustChangePassword: false, status: 'ACTIVE' },
    create: {
      email: 'admin@test.com',
      username: 'admin',
      passwordHash: hash,
      role: 'ADMIN',
      mustChangePassword: false,
      status: 'ACTIVE'
    }
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role, mustChangePassword: user.mustChangePassword, jwt_id: crypto.randomUUID() },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '24h' }
  );

  console.log('TOKEN=' + token);
}

main().finally(() => prisma.$disconnect());
