import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Departments
  const engineering = await prisma.department.upsert({
    where: { name: 'Engineering' },
    update: {},
    create: {
      name: 'Engineering',
      description: 'Software development, QA, and IT operations',
    },
  });

  const hr = await prisma.department.upsert({
    where: { name: 'Human Resources' },
    update: {},
    create: {
      name: 'Human Resources',
      description: 'Talent acquisition, employee relations, and benefits',
    },
  });

  const sales = await prisma.department.upsert({
    where: { name: 'Sales & Marketing' },
    update: {},
    create: {
      name: 'Sales & Marketing',
      description: 'Enterprise sales, partnerships, and campaigns',
    },
  });

  console.log('Seeded departments:', [engineering.name, hr.name, sales.name]);

  // 2. Create Skills
  const react = await prisma.skill.upsert({
    where: { name: 'React' },
    update: {},
    create: { name: 'React', description: 'Frontend React.js library' },
  });

  const nodejs = await prisma.skill.upsert({
    where: { name: 'Node.js' },
    update: {},
    create: { name: 'Node.js', description: 'Backend JavaScript runtime' },
  });

  const pg = await prisma.skill.upsert({
    where: { name: 'PostgreSQL' },
    update: {},
    create: { name: 'PostgreSQL', description: 'Relational Database Management System' },
  });

  const git = await prisma.skill.upsert({
    where: { name: 'Git' },
    update: {},
    create: { name: 'Git', description: 'Version control system' },
  });

  console.log('Seeded skills:', [react.name, nodejs.name, pg.name, git.name]);

  // 3. Create Admin User
  const adminEmail = 'admin@social-connect.com';
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isVerified: true,
      employee: {
        create: {
          firstName: 'System',
          lastName: 'Admin',
          email: adminEmail,
          phone: '1234567890',
          salary: 150000.00,
          departmentId: engineering.id,
          status: 'ACTIVE',
        },
      },
    },
  });

  console.log('Seeded Admin user:', adminUser.email);
  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
