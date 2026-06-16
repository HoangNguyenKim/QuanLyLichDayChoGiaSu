import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quản Lý Lịch Dạy Gia Sư API',
      version: '1.0.0',
      description: 'API cho hệ thống quản lý lịch dạy cá nhân cho gia sư',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development server' },
    ],
    tags: [
      { name: 'Students', description: 'Quản lý học sinh' },
      { name: 'Subjects', description: 'Quản lý môn học' },
      { name: 'Schedules', description: 'Quản lý lịch dạy' },
      { name: 'Dashboard', description: 'Thống kê tổng quan' },
      { name: 'Reminders', description: 'Quản lý nhắc nhở' },
    ],
  },
  apis: ['./src/modules/*/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
