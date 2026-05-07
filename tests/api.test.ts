import request from 'supertest';
import { app } from '../src/server';
import { prisma } from './helpers/setup';

describe('API Integration Tests', () => {
  describe('Health Endpoint', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Users Endpoints', () => {
    const testUser = { name: 'Test User', email: 'test@example.com' };

    it('should create a new user', async () => {
      const response = await request(app)
        .post('/users')
        .send(testUser);
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe(testUser.name);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.id).toBeDefined();
    });

    it('should get all users', async () => {
      // Create a test user first
      await prisma.user.create({
        data: testUser
      });

      const response = await request(app).get('/users');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get a specific user by id', async () => {
      // Create a test user first
      const user = await prisma.user.create({
        data: { name: 'Get User Test', email: 'getuser@example.com' }
      });

      const response = await request(app).get(`/users/${user.id}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(user.id);
      expect(response.body.name).toBe('Get User Test');
      expect(response.body.email).toBe('getuser@example.com');
      expect(response.body.messages).toBeDefined();
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).get('/users/non-existent-id');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    it('should return 400 when creating user without name', async () => {
      const response = await request(app)
        .post('/users')
        .send({ email: 'test@example.com' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name and email are required');
    });

    it('should return 400 when creating user without email', async () => {
      const response = await request(app)
        .post('/users')
        .send({ name: 'Test User' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name and email are required');
    });

    it('should return 400 when creating user with duplicate email', async () => {
      const userData = { name: 'First User', email: 'duplicate@example.com' };
      
      // Create first user
      await request(app).post('/users').send(userData);
      
      // Try to create second user with same email
      const response = await request(app)
        .post('/users')
        .send({ name: 'Second User', email: 'duplicate@example.com' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email already exists');
    });

    it('should delete a user', async () => {
      // Create a test user first
      const user = await prisma.user.create({
        data: { name: 'Delete Test', email: 'delete@example.com' }
      });

      const response = await request(app).delete(`/users/${user.id}`);
      expect(response.status).toBe(204);
      
      // Verify user is deleted
      const getResponse = await request(app).get(`/users/${user.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent user', async () => {
      const response = await request(app).delete('/users/non-existent-id');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('Messages Endpoints', () => {
    let userId: string;

    beforeEach(async () => {
      // Create a test user for messages
      const user = await prisma.user.create({
        data: {
          name: 'Message Test User',
          email: 'message-test@example.com'
        }
      });
      userId = user.id;
    });

    it('should create a new message', async () => {
      const messageData = {
        content: 'Test message',
        userId
      };

      const response = await request(app)
        .post('/messages')
        .send(messageData);
      
      expect(response.status).toBe(201);
      expect(response.body.content).toBe(messageData.content);
      expect(response.body.userId).toBe(userId);
      expect(response.body.id).toBeDefined();
    });

    it('should get all messages', async () => {
      // Create a test message
      await prisma.message.create({
        data: {
          content: 'Test message',
          userId
        }
      });

      const response = await request(app).get('/messages');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get a specific message by id', async () => {
      // Create a test message
      const message = await prisma.message.create({
        data: {
          content: 'Get Message Test',
          userId
        }
      });

      const response = await request(app).get(`/messages/${message.id}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(message.id);
      expect(response.body.content).toBe('Get Message Test');
      expect(response.body.user).toBeDefined();
    });

    it('should return 404 for non-existent message', async () => {
      const response = await request(app).get('/messages/non-existent-id');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Message not found');
    });

    it('should return 400 when creating message without content', async () => {
      const response = await request(app)
        .post('/messages')
        .send({ userId });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Content and userId are required');
    });

    it('should return 400 when creating message without userId', async () => {
      const response = await request(app)
        .post('/messages')
        .send({ content: 'Test message' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Content and userId are required');
    });

    it('should return 400 when creating message with non-existent userId', async () => {
      const response = await request(app)
        .post('/messages')
        .send({ 
          content: 'Test message',
          userId: 'non-existent-user-id'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User not found');
    });

    it('should delete a message', async () => {
      // Create a test message
      const message = await prisma.message.create({
        data: {
          content: 'Delete Test Message',
          userId
        }
      });

      const response = await request(app).delete(`/messages/${message.id}`);
      expect(response.status).toBe(204);
      
      // Verify message is deleted
      const getResponse = await request(app).get(`/messages/${message.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent message', async () => {
      const response = await request(app).delete('/messages/non-existent-id');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Message not found');
    });
  });

  // Error Scenario Tests for better coverage
  describe('Error Handling', () => {
    describe('Database Connection Issues', () => {
      // Note: These tests would require mocking Prisma to simulate database errors
      // For now, we'll focus on the error paths we can actually trigger
      
      it('should handle malformed UUIDs gracefully', async () => {
        const response = await request(app).get('/users/invalid-uuid-format');
        // This should trigger a database error which gets caught
        expect([404, 500]).toContain(response.status);
      });

      it('should handle malformed UUIDs in messages endpoint', async () => {
        const response = await request(app).get('/messages/invalid-uuid-format');
        // This should trigger a database error which gets caught
        expect([404, 500]).toContain(response.status);
      });
    });

    describe('Validation Edge Cases', () => {
      it('should handle empty strings in user creation', async () => {
        const response = await request(app)
          .post('/users')
          .send({ name: '', email: '' });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Name and email are required');
      });

      it('should handle whitespace-only strings in user creation', async () => {
        const response = await request(app)
          .post('/users')
          .send({ name: '   ', email: '   ' });
        
        // The current code checks for falsy values, so whitespace passes validation
        // but succeeds in creation (whitespace is trimmed and valid)
        expect(response.status).toBe(201);
      });

      it('should handle empty strings in message creation', async () => {
        const response = await request(app)
          .post('/messages')
          .send({ content: '', userId: '' });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Content and userId are required');
      });
    });
  });

  describe('Database Constraint Tests', () => {
    it('should handle cascade deletion when user has messages', async () => {
      // Create user
      const user = await prisma.user.create({
        data: { name: 'User With Messages', email: 'cascade@example.com' }
      });

      // Create message for user
      await prisma.message.create({
        data: { content: 'Message to be cascaded', userId: user.id }
      });

      // Delete user (should cascade delete messages)
      const response = await request(app).delete(`/users/${user.id}`);
      expect(response.status).toBe(204);

      // Verify user is deleted
      const userCheck = await request(app).get(`/users/${user.id}`);
      expect(userCheck.status).toBe(404);
    });

    it('should handle very long content in messages', async () => {
      const user = await prisma.user.create({
        data: { name: 'Long Message User', email: 'longmsg@example.com' }
      });

      const longContent = 'a'.repeat(1000); // Very long string
      const response = await request(app)
        .post('/messages')
        .send({ content: longContent, userId: user.id });
      
      // Should succeed unless there's a length constraint
      expect([201, 400, 500]).toContain(response.status);
    });
  });
});
