const Redis = require('ioredis');

let redis = null;

const connectRedis = () => {
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });
    
    redis.on('connect', () => {
      console.log(' Redis connected');
    });
    
    redis.on('error', (err) => {
      console.error(' Redis error:', err.message);
    });
    
    return redis;
  } catch (error) {
    console.error('Redis connection failed:', error.message);
    return null;
  }
};

const getRedis = () => {
  if (!redis) {
    redis = connectRedis();
  }
  return redis;
};

module.exports = { connectRedis, getRedis };