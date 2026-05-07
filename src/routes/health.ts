import { Router } from 'express';

const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    hostname: process.env.HOSTNAME || require('os').hostname()
  });
});

export { healthRouter };
