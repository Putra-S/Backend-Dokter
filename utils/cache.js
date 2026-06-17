const redis = require('../config/redis');
const { logger } = require('../middleware/logger');

class CacheService {
  constructor() {
    this._store = new Map();
    this._stats = { hits: 0, misses: 0 };
    this._redis = redis;
    this._type = 'memory';

    this._redis.on('ready', () => {
      this._type = 'redis';
      logger.info('Connected to Redis Cache Service');
    });

    this._redis.on('error', (err) => {
      if (this._type === 'redis') {
        logger.error(`Redis Service Error: ${err.message}`);
        this._type = 'memory';
      }
    });

    this._cleanupInterval = setInterval(() => {
      if (this._type === 'memory') {
        this._cleanup();
      }
    }, 60_000).unref();
  }

  async initRedis() {
    if (this._redis.status === 'ready') {
      this._type = 'redis';
    }
  }

  async get(key) {
    if (this._type === 'redis' && this._redis.status === 'ready') {
      try {
        const val = await this._redis.get(key);
        if (val) {
          this._stats.hits++;
          return JSON.parse(val);
        }
      } catch (err) {
        logger.error(`Redis Get Error: ${err.message}`);
      }
    }

    const entry = this._store.get(key);
    if (!entry) {
      this._stats.misses++;
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      this._stats.misses++;
      return undefined;
    }

    this._stats.hits++;
    return entry.value;
  }

  async set(key, value, ttlSeconds = 300) {
    if (this._type === 'redis' && this._redis.status === 'ready') {
      try {
        await this._redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return value;
      } catch (err) {
        logger.error(`Redis Set Error: ${err.message}`);
      }
    }

    this._store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
      createdAt: Date.now(),
    });
    return value;
  }

  async remember(key, fetchFn, ttlSeconds = 300) {
    const cached = await this.get(key);
    if (cached !== undefined) return cached;

    const pendingKey = `_pending_${key}`;
    if (this._store.has(pendingKey)) {
      return this._store.get(pendingKey).value;
    }

    const fetchPromise = fetchFn();
    this._store.set(pendingKey, { value: fetchPromise, expiresAt: Date.now() + 30_000 });

    try {
      const result = await fetchPromise;
      await this.set(key, result, ttlSeconds);
      return result;
    } finally {
      this._store.delete(pendingKey);
    }
  }

  async del(key) {
    if (this._type === 'redis' && this._redis.status === 'ready') {
      await this._redis.del(key);
    }
    this._store.delete(key);
  }

  async delByPrefix(prefix) {
    if (this._type === 'redis' && this._redis.status === 'ready') {
      const keys = await this._redis.keys(`${prefix}*`);
      if (keys.length > 0) await this._redis.del(...keys);
    }
    for (const key of this._store.keys()) {
      if (key.startsWith(prefix)) {
        this._store.delete(key);
      }
    }
  }

  async flush() {
    if (this._type === 'redis' && this._redis.status === 'ready') {
      await this._redis.flushdb();
    }
    this._store.clear();
    this._stats = { hits: 0, misses: 0 };
  }

  stats() {
    const totalEntries = [...this._store.keys()].filter((k) => !k.startsWith('_pending_')).length;
    const total = this._stats.hits + this._stats.misses;
    return {
      type: this._type,
      entries: totalEntries,
      hits: this._stats.hits,
      misses: this._stats.misses,
      hitRate: total > 0 ? `${((this._stats.hits / total) * 100).toFixed(1)}%` : '0%',
    };
  }

  _cleanup() {
    const now = Date.now();
    for (const [key, entry] of this._store.entries()) {
      if (now > entry.expiresAt) {
        this._store.delete(key);
      }
    }
  }

  destroy() {
    clearInterval(this._cleanupInterval);

    this._store.clear();
    this._stats = { hits: 0, misses: 0 };
  }
}

const cacheInstance = new CacheService();

module.exports = cacheInstance;
