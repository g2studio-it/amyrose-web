import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  apiPrefix: process.env['API_PREFIX'] ?? 'api/v1',
  allowedOrigins: process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:3000',
  throttleTtl: parseInt(process.env['THROTTLE_TTL'] ?? '60', 10),
  throttleLimit: parseInt(process.env['THROTTLE_LIMIT'] ?? '100', 10),
}));
