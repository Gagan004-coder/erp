import './config/env';
import app from './app';
import { env } from './config/env';
import prisma from './config/prisma';

const PORT = parseInt(env.PORT, 10);

async function main() {
  await prisma.$connect();
  console.log('Database connected');

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
