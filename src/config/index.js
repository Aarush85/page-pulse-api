require('dotenv').config();
const { z } = require('zod');

const envSchema = z.object({
  PORT: z.string().default('3000'),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  CACHE_TTL_SECONDS: z.string().transform(Number).default('3600'),
  CONCURRENCY_LIMIT: z.string().transform(Number).default('50'),
  REQUEST_TIMEOUT_MS: z.string().transform(Number).default('5000'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000'),
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

module.exports = {
  env: _env.data,
};
