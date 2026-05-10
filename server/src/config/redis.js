import Redis from 'ioredis';

// Try to connect to Redis, but don't crash if it's not available
let redis;
let isRedisAvailable = false;

try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 2) {
        console.warn('Could not connect to Redis. Falling back to in-memory cache.');
        return null; // Stop retrying
      }
      return Math.min(times * 50, 2000);
    }
  });

  redis.on('connect', () => {
    console.log('Redis connected');
    isRedisAvailable = true;
  });

  redis.on('error', (err) => {
    isRedisAvailable = false;
  });
} catch (e) {
  isRedisAvailable = false;
}

// Fallback in-memory cache
const memoryCache = new Map();

export const getCache = async (key) => {
  if (isRedisAvailable && redis) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Redis get error, falling back to memory cache', e);
    }
  }
  const cached = memoryCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }
  if (cached && cached.expiresAt <= Date.now()) {
    memoryCache.delete(key);
  }
  return null;
};

export const setCache = async (key, value, ttlSeconds = 3600) => {
  if (isRedisAvailable && redis) {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return;
    } catch (e) {
      console.warn('Redis set error, falling back to memory cache', e);
    }
  }
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + (ttlSeconds * 1000)
  });
};

export const invalidateCache = async (pattern) => {
  if (isRedisAvailable && redis) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return;
    } catch (e) {}
  }
  
  // Very basic pattern matching for memory cache
  const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key);
    }
  }
};

export default redis;
