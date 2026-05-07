import { Router } from 'express';
import prisma from '../lib/prisma';
import logger from '../lib/logger';

const messagesRouter = Router();

messagesRouter.get('/', async (req, res) => {
  logger.info('GET /messages request received');
  try {
    const messages = await prisma.message.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    logger.info({ count: messages.length }, 'Fetched messages');
    res.json(messages);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching messages');
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

messagesRouter.get('/:id', async (req, res) => {
  logger.info({ id: req.params.id }, 'GET /messages/:id request received');
  try {
    const message = await prisma.message.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });
    
    if (!message) {
      logger.warn({ id: req.params.id }, 'Message not found');
      return res.status(404).json({ error: 'Message not found' });
    }
    
    logger.info({ id: req.params.id }, 'Fetched message');
    res.json(message);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching message');
    res.status(500).json({ error: 'Error fetching message' });
  }
});

messagesRouter.post('/', async (req, res) => {
  logger.info({ body: req.body }, 'POST /messages request received');
  const { content, userId } = req.body;
  
  if (!content || !userId) {
    logger.warn('Content and userId are required');
    return res.status(400).json({ error: 'Content and userId are required' });
  }

  try {
    const newMessage = await prisma.message.create({
      data: {
        content,
        userId
      },
      include: { user: true }
    });
    logger.info({ id: newMessage.id }, 'Message created');
    res.status(201).json(newMessage);
  } catch (error) {
    logger.error({ err: error }, 'Error creating message');
    if (error instanceof Error && (error as any).code === 'P2003') {
      logger.warn({ userId }, 'User not found for message');
      return res.status(400).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Error creating message' });
  }
});

messagesRouter.delete('/:id', async (req, res) => {
  const id = req.params.id;
  logger.info({ id }, 'DELETE /messages/:id request received');
  try {
    await prisma.message.delete({
      where: { id }
    });
    logger.info({ id }, 'Message deleted');
    res.status(204).send();
  } catch (error) {
    logger.error({ err: error }, 'Error deleting message');
    if (error instanceof Error && (error as any).code === 'P2025') {
      logger.warn({ id }, 'Message not found');
      return res.status(404).json({ error: 'Message not found' });
    }
    res.status(500).json({ error: 'Error deleting message' });
  }
});

export { messagesRouter };
