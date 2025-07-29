const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const { resetTestDB } = require('../utils/testUtils');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

beforeAll(async () => {
  await resetTestDB();
});

afterAll(() => {
  return db.end();
});

describe('POST /api/register', () => {
    const newUser = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        phone: '0123456789',
        shift: '1st'
    };

    beforeEach(async () => {
      await db.query('DELETE FROM users;');
    });

    test('201: should create a new user and return expected fields', async () => {
        const res = await request(app)
          .post('/api/register')
          .send(newUser);
        
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toMatchObject({
          name: newUser.name,
          email: newUser.email,
          shift: newUser.shift,
          role: 'user', 
          isApproved: false 
        });
    
        expect(res.body.user.id).toEqual(expect.any(Number));
    });

    test('201: should assign a manager if shift is provided', async () => {
    });
 
    test('409: responds with error if email already exists', async () => {
      await request(app)
        .post('/api/register')
        .send(newUser); 

      const duplicate = {
        ...newUser,
        name: 'Duplicate Name',
        phone: '0777777777'
      };
  
      const res = await request(app)
        .post('/api/register')
        .send(duplicate);
  
      expect(res.statusCode).toBe(409);
      expect(res.body.msg).toBe('User with this email already exists.');
    });
  
    test('400: responds with error if required fields are missing', async () => {
      const badUser = {
        email: 'not-an-email',
        password: '123'
      };
  
      const res = await request(app)
        .post('/api/register')
        .send(badUser);
        
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: 'Name is required' }),
          expect.objectContaining({ msg: 'Valid email is required' }),
          expect.objectContaining({ msg: 'Password must be at least 6 characters' })
        ])
      );
    });

    test('422: should return error if email format is invalid', async () => {
        const invalidUser = { ...newUser, email: 'not-an-email' };
      
        const res = await request(app)
          .post('/api/register')
          .send(invalidUser);
      
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ msg: 'Valid email is required' })
          ])
        );
      });
  });

describe('POST /api/login', () => {
  beforeEach(async () => {
    await db.query('DELETE FROM users;');
    const hashedPassword = await bcrypt.hash('testpass', 10);
    await db.query(`
      INSERT INTO users (name, email, password, role, is_approved)
      VALUES ('Approved User', 'approved@example.com', $1, 'user', true);
    `, [hashedPassword]);
  });

  test('200: logs in an approved user and returns a token', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'approved@example.com',
        password: 'testpass'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe('Login successful');

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();

    const tokenCookie = cookies.find((c) => c.startsWith('token='));
    expect(tokenCookie).toBeDefined();
  });

  test('401: returns error for unapproved user', async () => {
    await db.query(`
      INSERT INTO users (name, email, password, role, is_approved)
      VALUES ('Pending User', 'pending@example.com', 'testpass', 'user', false);
    `);

    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'pending@example.com',
        password: 'testpass'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe('Invalid credentials or account not approved.');
  });

  test('400: returns error for missing fields', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ }); 

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Email is required' }),
        expect.objectContaining({ msg: 'Password is required' })
      ])
    );
  });

  test('401: returns error for invalid credentials/account not approved', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'approved@example.com',
        password: 'wrongpass'
      });
    
    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe('Invalid credentials or account not approved.');
  });
});

describe('GET /api/protected', () => {
  let validToken;

  beforeEach(async () => {
    await db.query('DELETE FROM users;');
    const hashedPassword = await bcrypt.hash('testpass', 10);
    await db.query(`
      INSERT INTO users (name, email, password, role, is_approved)
      VALUES ('Approved User', 'auth@example.com', $1, 'user', true);
    `, [hashedPassword]);

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'auth@example.com', password: 'testpass' });

    const setCookieHeader = res.headers['set-cookie'];
    const tokenCookie = setCookieHeader.find((cookie) => cookie.startsWith('token='));
    const tokenValue = tokenCookie.split(';')[0].split('=')[1];

    validToken = tokenValue;
  });

    test('✅ 200: returns user info with valid token in Cookie', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Cookie', [`token=${validToken}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('role');
    expect(res.body).toHaveProperty('email');
    expect(res.body.isApproved).toBe(true);
  });

  test('✅ 200: returns user info with valid token in Authorization header', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('role');
    expect(res.body).toHaveProperty('email');
    expect(res.body.isApproved).toBe(true);
  });

  test('❌ 401: returns error if no token is provided', async () => {
    const res = await request(app).get('/api/protected');
    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe('Access denied. No token provided.');
  });

  test('❌ 403: returns error for invalid token in Authorization', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(res.statusCode).toBe(403);
    expect(res.body.msg).toBe('Invalid or expired token.');
  });

  test('❌ 403: returns error for invalid token in Cookie', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Cookie', ['token=invalid.token.here']);

    expect(res.statusCode).toBe(403);
    expect(res.body.msg).toBe('Invalid or expired token.');
  });
});

describe('DELETE /api/logout', () => {
  beforeEach(async () => {
    await db.query('DELETE FROM users;');
    const hashedPassword = await bcrypt.hash('testpass', 10);
    await db.query(`
      INSERT INTO users (name, email, password, role, is_approved)
      VALUES ('Approved User', 'approved@example.com', $1, 'user', true);
    `, [hashedPassword]);
  });

  test('200: logs out the user (client should delete token)', async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({ email: 'approved@example.com', password: 'testpass' });

    const token = loginRes.body.token;

    const res = await request(app)
      .delete('/api/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe('Logout successful');
  });
});

describe('JWT behavior after login and logout', () => {
  let token;

  beforeEach(async () => {
    await db.query('DELETE FROM users;');
    const hashedPassword = await bcrypt.hash('logoutpass', 10);
    await db.query(`
      INSERT INTO users (name, email, password, role, is_approved)
      VALUES ('Logout User', 'logout@example.com', $1, 'user', true);
    `, [hashedPassword]);

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'logout@example.com', password: 'logoutpass' });

    token = res.body.token;
  });

  test('200: access protected route with valid token', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('logout@example.com');
  });

  test('401: access protected route without token', async () => {
    const res = await request(app).get('/api/protected');
    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe('Access denied. No token provided.');
  });

  test('403: access protected route with invalid token', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer not.a.valid.token`);
    expect(res.statusCode).toBe(403);
    expect(res.body.msg).toBe('Invalid or expired token.');
  });

  test('token remains technically valid after logout (client must delete it)', async () => {
    // 1. Confirm access works with valid token
    const beforeLogout = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(beforeLogout.statusCode).toBe(200);

    // 2. Perform logout (no token invalidation on server)
    const logout = await request(app)
      .delete('/api/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(logout.statusCode).toBe(200);
    expect(logout.body.msg).toBe('Logout successful');

    // 3. Try the same token again — still works unless server blacklists
    const afterLogout = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`);

    // ⚠️ This will be 200 unless your server tracks invalid tokens
    expect(afterLogout.statusCode).toBe(200);
  });
});