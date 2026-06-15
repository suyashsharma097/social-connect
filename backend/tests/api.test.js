import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';

describe('API Endpoint Tests', () => {
  let adminToken;
  let employeeToken;

  beforeAll(async () => {
    // Clear old test data if any
    await prisma.leave.deleteMany({});
    await prisma.leaveBalance.deleteMany({});
    await prisma.asset.deleteMany({});
    await prisma.employeeSkill.deleteMany({});
    await prisma.employee.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.department.deleteMany({});
    await prisma.skill.deleteMany({});

    // Seed temporary department
    const dept = await prisma.department.create({
      data: {
        name: 'Test Engineering',
        description: 'Test Department',
      },
    });

    // Create Admin User
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test-admin@social-connect.com',
        password: 'password123',
        role: 'ADMIN',
      });

    // Verify Admin
    await prisma.user.update({
      where: { email: 'test-admin@social-connect.com' },
      data: { isVerified: true },
    });

    // Login Admin
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test-admin@social-connect.com',
        password: 'password123',
      });

    adminToken = adminLogin.body.data.accessToken;

    // Create Employee User
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test-employee@social-connect.com',
        password: 'password123',
        role: 'EMPLOYEE',
      });

    // Verify Employee
    await prisma.user.update({
      where: { email: 'test-employee@social-connect.com' },
      data: { isVerified: true },
    });

    // Login Employee
    const employeeLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test-employee@social-connect.com',
        password: 'password123',
      });

    employeeToken = employeeLogin.body.data.accessToken;
  });

  afterAll(async () => {
    // Clean up
    await prisma.leave.deleteMany({});
    await prisma.leaveBalance.deleteMany({});
    await prisma.asset.deleteMany({});
    await prisma.employeeSkill.deleteMany({});
    await prisma.employee.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.department.deleteMany({});
    await prisma.skill.deleteMany({});
    await prisma.$disconnect();
  });

  describe('Auth Endpoints', () => {
    it('should login and return JWT tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test-admin@social-connect.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should block login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test-admin@social-connect.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });
  });

  describe('Employee & Dashboard Endpoints', () => {
    it('should allow Admin to retrieve employee listing', async () => {
      const res = await request(app)
        .get('/api/v1/employees')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('data');
    });

    it('should restrict employee listing to non-management users', async () => {
      const res = await request(app)
        .get('/api/v1/employees')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(403);
    });

    it('should return dashboard stats for authenticated users', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('personal');
    });
  });
});
