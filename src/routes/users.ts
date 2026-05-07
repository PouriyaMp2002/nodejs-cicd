import { Router } from 'express';
import prisma from '../lib/prisma';
import logger from '../lib/logger';

const usersRouter = Router();

usersRouter.get('/', async (req, res) => {
  logger.info('GET /users request received');
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    logger.info({ count: users.length }, 'Fetched users');
    res.json(users);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching users');
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

usersRouter.get('/:id', async (req, res) => {
  logger.info({ id: req.params.id }, 'GET /users/:id request received');
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { messages: true }
    });
    
    if (!user) {
      logger.warn({ id: req.params.id }, 'User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    
    logger.info({ id: req.params.id }, 'Fetched user');
    res.json(user);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching user');
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

usersRouter.post('/', async (req, res) => {
  logger.info({ body: req.body }, 'POST /users request received');
  const { name, email } = req.body;
  
  if (!name || !email) {
    logger.warn('Name and email are required');
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const user = await prisma.user.create({
      data: { name, email }
    });
    logger.info({ id: user.id }, 'User created');
    res.status(201).json(user);
  } catch (error) {
    logger.error({ err: error }, 'Error creating user');
    if (error instanceof Error && (error as any).code === 'P2002') {
      logger.warn({ email }, 'Email already exists');
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

usersRouter.delete('/:id', async (req, res) => {
  logger.info({ id: req.params.id }, 'DELETE /users/:id request received');
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });
    logger.info({ id: req.params.id }, 'User deleted');
    res.status(204).send();
  } catch (error) {
    logger.error({ err: error }, 'Error deleting user');
    if (error instanceof Error && (error as any).code === 'P2025') {
      logger.warn({ id: req.params.id }, 'User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export { usersRouter };
