import redisClient from "../config/redis.js";

class CacheService {
  async get(key) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set(key, value, ttl = 86400) {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  async delete(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  }

  async flush() {
    try {
      await redisClient.flushAll();
      return true;
    } catch (error) {
      console.error("Cache flush error:", error);
      return false;
    }
  }

  generateKey(state, district, finYear) {
    return `district:${state}:${district}:${finYear}`;
  }
}

export default new CacheService();
