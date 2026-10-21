import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';
import { seedAll } from './seed/seed.js';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        env.CLIENT_URL.includes('*') ||
        env.CLIENT_URL.some(allowed => origin.startsWith(allowed))
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use('/api', apiRouter);
app.use(errorHandler);

async function startServer() {
  await connectDB();

  try {
    await seedAll();
  } catch (seedErr) {
    console.error('Notice on initial seed check:', seedErr.message);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Backend is running smoothly on port ${env.PORT}`);
  });

  return server;
}

startServer();

export default app;
