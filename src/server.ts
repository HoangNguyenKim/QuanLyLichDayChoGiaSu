import app from './app';
import { config } from './config';

const start = async () => {
  try {
    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
      console.log(`📚 Swagger docs: http://localhost:${config.port}/api-docs`);
      console.log(`🏥 Health check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
