import redisService from '../services/redisService.js';

/**
 * Redis-based Rate Limiter for API endpoints
 * Provides flexible rate limiting with different strategies
 */
class RateLimiter {
  constructor() {
    this.redis = redisService;
  }

  /**
   * Basic rate limiting using sliding window counter
   * @param {string} identifier - Unique identifier (IP, user ID, etc.)
   * @param {number} windowMs - Time window in milliseconds
   * @param {number} maxRequests - Maximum requests allowed in window
   * @param {string} [prefix='rate_limit'] - Redis key prefix
   * @returns {Promise<Object>} Rate limit info
   */
  async checkRateLimit(identifier, windowMs, maxRequests, prefix = 'rate_limit') {
    const key = `${prefix}:${identifier}`;
    const window = Math.floor(Date.now() / windowMs);
    const windowKey = `${key}:${window}`;

    try {
      // Get current count for this window
      const current = await this.redis.get(windowKey);
      const count = current ? parseInt(current) : 0;

      if (count >= maxRequests) {
        // Rate limit exceeded
        const resetTime = (window + 1) * windowMs;
        return {
          allowed: false,
          count: count,
          limit: maxRequests,
          resetTime: resetTime,
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
        };
      }

      // Increment counter
      const newCount = await this.redis.incr(windowKey);

      // Set expiry for the window (TTL = windowMs in seconds)
      if (newCount === 1) {
        await this.redis.expire(windowKey, Math.ceil(windowMs / 1000));
      }

      const resetTime = (window + 1) * windowMs;
      return {
        allowed: true,
        count: newCount,
        limit: maxRequests,
        resetTime: resetTime,
        remaining: maxRequests - newCount
      };

    } catch (error) {
      console.error('Rate limiter error:', error);
      // In case of Redis error, allow the request (fail open)
      return {
        allowed: true,
        count: 0,
        limit: maxRequests,
        remaining: maxRequests,
        error: true
      };
    }
  }

  /**
   * Advanced sliding window rate limiting
   * More accurate than fixed window, uses weighted counter
   * @param {string} identifier - Unique identifier
   * @param {number} windowMs - Time window in milliseconds
   * @param {number} maxRequests - Maximum requests allowed
   * @param {string} [prefix='sliding_limit'] - Redis key prefix
   * @returns {Promise<Object>} Rate limit info
   */
  async slidingWindowRateLimit(identifier, windowMs, maxRequests, prefix = 'sliding_limit') {
    const now = Date.now();
    const key = `${prefix}:${identifier}`;
    const currentWindow = Math.floor(now / windowMs);
    const previousWindow = currentWindow - 1;

    const currentKey = `${key}:${currentWindow}`;
    const previousKey = `${key}:${previousWindow}`;

    try {
      // Get counts for current and previous windows
      const [currentCount, previousCount] = await Promise.all([
        this.redis.get(currentKey).then(val => parseInt(val) || 0),
        this.redis.get(previousKey).then(val => parseInt(val) || 0)
      ]);

      // Calculate weighted count based on time passed in current window
      const timeInCurrentWindow = now - (currentWindow * windowMs);
      const weightOfPreviousWindow = 1 - (timeInCurrentWindow / windowMs);
      const weightedCount = Math.floor(
        currentCount + (previousCount * weightOfPreviousWindow)
      );

      if (weightedCount >= maxRequests) {
        return {
          allowed: false,
          count: weightedCount,
          limit: maxRequests,
          resetTime: (currentWindow + 1) * windowMs,
          retryAfter: Math.ceil(((currentWindow + 1) * windowMs - now) / 1000)
        };
      }

      // Increment current window counter
      const newCount = await this.redis.incr(currentKey);

      // Set TTL for current window
      if (newCount === 1) {
        await this.redis.expire(currentKey, Math.ceil(windowMs / 1000) * 2);
      }

      return {
        allowed: true,
        count: Math.max(weightedCount, newCount),
        limit: maxRequests,
        remaining: maxRequests - Math.max(weightedCount, newCount),
        resetTime: (currentWindow + 1) * windowMs
      };

    } catch (error) {
      console.error('Sliding window rate limiter error:', error);
      return {
        allowed: true,
        count: 0,
        limit: maxRequests,
        remaining: maxRequests,
        error: true
      };
    }
  }

  /**
   * Token bucket rate limiting
   * Allows bursts but maintains average rate
   * @param {string} identifier - Unique identifier
   * @param {number} capacity - Maximum tokens in bucket
   * @param {number} refillRate - Tokens added per second
   * @param {number} [tokens=1] - Tokens to consume
   * @param {string} [prefix='token_bucket'] - Redis key prefix
   * @returns {Promise<Object>} Rate limit info
   */
  async tokenBucketRateLimit(identifier, capacity, refillRate, tokens = 1, prefix = 'token_bucket') {
    const key = `${prefix}:${identifier}`;
    const now = Date.now() / 1000; // Convert to seconds

    try {
      // Get current bucket state
      const bucketData = await this.redis.hgetall(key);

      let currentTokens = parseFloat(bucketData.tokens) || capacity;
      let lastRefill = parseFloat(bucketData.lastRefill) || now;

      // Calculate tokens to add based on time passed
      const timePassed = now - lastRefill;
      const tokensToAdd = timePassed * refillRate;
      currentTokens = Math.min(capacity, currentTokens + tokensToAdd);

      if (currentTokens < tokens) {
        // Not enough tokens
        const waitTime = (tokens - currentTokens) / refillRate;
        return {
          allowed: false,
          tokens: currentTokens,
          capacity: capacity,
          retryAfter: Math.ceil(waitTime)
        };
      }

      // Consume tokens
      currentTokens -= tokens;

      // Update bucket state
      await Promise.all([
        this.redis.hset(key, 'tokens', currentTokens.toString()),
        this.redis.hset(key, 'lastRefill', now.toString()),
        this.redis.expire(key, 3600) // Expire bucket after 1 hour of inactivity
      ]);

      return {
        allowed: true,
        tokens: currentTokens,
        capacity: capacity,
        refillRate: refillRate
      };

    } catch (error) {
      console.error('Token bucket rate limiter error:', error);
      return {
        allowed: true,
        tokens: capacity,
        capacity: capacity,
        error: true
      };
    }
  }

  /**
   * Express middleware for rate limiting
   * @param {Object} options - Rate limiting options
   * @returns {Function} Express middleware
   */
  middleware(options = {}) {
    const {
      windowMs = 15 * 60 * 1000, // 15 minutes
      maxRequests = 100,
      keyGenerator = (req) => req.ip,
      strategy = 'sliding', // 'fixed', 'sliding', 'token'
      prefix = 'api_limit',
      skipSuccessfulRequests = false,
      skipFailedRequests = false,
      // Token bucket specific options
      capacity = maxRequests,
      refillRate = maxRequests / (windowMs / 1000)
    } = options;

    return async (req, res, next) => {
      try {
        const identifier = keyGenerator(req);
        let result;

        switch (strategy) {
          case 'fixed':
            result = await this.checkRateLimit(identifier, windowMs, maxRequests, prefix);
            break;
          case 'sliding':
            result = await this.slidingWindowRateLimit(identifier, windowMs, maxRequests, prefix);
            break;
          case 'token':
            result = await this.tokenBucketRateLimit(identifier, capacity, refillRate, 1, prefix);
            break;
          default:
            result = await this.slidingWindowRateLimit(identifier, windowMs, maxRequests, prefix);
        }

        // Set rate limit headers
        res.set({
          'X-RateLimit-Limit': result.limit || capacity,
          'X-RateLimit-Remaining': result.remaining || result.tokens || 0,
          'X-RateLimit-Reset': result.resetTime ? new Date(result.resetTime).toISOString() : ''
        });

        if (!result.allowed) {
          res.set('Retry-After', result.retryAfter);
          return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded',
            retryAfter: result.retryAfter
          });
        }

        // Handle skip conditions
        const originalSend = res.send;
        res.send = function(body) {
          const shouldSkip = (
            (skipSuccessfulRequests && res.statusCode < 400) ||
            (skipFailedRequests && res.statusCode >= 400)
          );

          if (shouldSkip) {
            // Decrement counter for skipped requests
            // This is a simplified approach; in production, you might want more sophisticated logic
          }

          return originalSend.call(this, body);
        };

        next();

      } catch (error) {
        console.error('Rate limiter middleware error:', error);
        // Fail open - allow request if rate limiter fails
        next();
      }
    };
  }

  /**
   * Clear rate limit for specific identifier
   * @param {string} identifier - Identifier to clear
   * @param {string} [prefix='rate_limit'] - Redis key prefix
   * @returns {Promise<number>} Number of keys deleted
   */
  async clearRateLimit(identifier, prefix = 'rate_limit') {
    try {
      // Use Redis SCAN to find all keys for this identifier
      const pattern = `${prefix}:${identifier}:*`;
      const keys = [];

      // Since we don't have SCAN in this simple implementation,
      // we'll clear the most common patterns
      const now = Date.now();
      const window = Math.floor(now / (15 * 60 * 1000)); // 15-minute windows

      const keysToDelete = [
        `${prefix}:${identifier}:${window}`,
        `${prefix}:${identifier}:${window - 1}`,
        `${prefix}:${identifier}` // Token bucket key
      ];

      return await this.redis.del(keysToDelete);
    } catch (error) {
      console.error('Clear rate limit error:', error);
      throw error;
    }
  }

  /**
   * Get rate limit status for identifier
   * @param {string} identifier - Identifier to check
   * @param {number} windowMs - Time window in milliseconds
   * @param {number} maxRequests - Maximum requests allowed
   * @param {string} [prefix='rate_limit'] - Redis key prefix
   * @returns {Promise<Object>} Current rate limit status
   */
  async getRateLimitStatus(identifier, windowMs, maxRequests, prefix = 'rate_limit') {
    const key = `${prefix}:${identifier}`;
    const window = Math.floor(Date.now() / windowMs);
    const windowKey = `${key}:${window}`;

    try {
      const count = await this.redis.get(windowKey);
      const currentCount = count ? parseInt(count) : 0;
      const resetTime = (window + 1) * windowMs;

      return {
        count: currentCount,
        limit: maxRequests,
        remaining: Math.max(0, maxRequests - currentCount),
        resetTime: resetTime,
        blocked: currentCount >= maxRequests
      };
    } catch (error) {
      console.error('Get rate limit status error:', error);
      return {
        count: 0,
        limit: maxRequests,
        remaining: maxRequests,
        resetTime: Date.now() + windowMs,
        blocked: false,