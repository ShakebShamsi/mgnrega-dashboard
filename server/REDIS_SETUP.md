# Redis Setup Guide for MGNREGA Dashboard - Upstash Configuration

This guide will help you set up Redis using Upstash for your MGNREGA Dashboard application.

## Table of Contents
- [Overview](#overview)
- [Upstash Redis Setup](#upstash-redis-setup)
- [Environment Configuration](#environment-configuration)
- [Code Implementation](#code-implementation)
- [Usage Examples](#usage-examples)
- [Rate Limiting](#rate-limiting)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

This project uses Redis for caching, session management, and rate limiting. The implementation supports both Upstash Redis (cloud) and traditional Redis instances with automatic fallback.

### Key Features
- ✅ Upstash Redis cloud integration
- ✅ Automatic connection management
- ✅ Error handling and reconnection
- ✅ Rate limiting middleware
- ✅ Caching utilities
- ✅ Session management
- ✅ Fallback to local Redis

## Upstash Redis Setup

### Step 1: Create Upstash Account
1. Go to [Upstash Console](https://console.upstash.com/)
2. Sign up or log in to your account
3. Click "Create Database"

### Step 2: Configure Database
1. **Name**: Choose a name for your database (e.g., `mgnrega-dashboard`)
2. **Region**: Select the region closest to your application
3. **Type**: Choose "Redis" (default)
4. **TLS**: Enable TLS (recommended for production)

### Step 3: Get Connection Details
After creating the database, you'll get:
- **Redis URL**: `redis://default:password@endpoint.upstash.io:6379`
- **Password**: Your Redis password
- **Endpoint**: Your Redis endpoint
- **Port**: Usually 6379

## Environment Configuration

### Update .env File

Create or update your `.env` file with Upstash credentials:

```env
# Upstash Redis Configuration (Primary)
UPSTASH_REDIS_URL=redis://default:your_password@your-endpoint.upstash.io:6379
UPSTASH_REDIS_PASSWORD=your_upstash_redis_password

# Traditional Redis Configuration (Fallback)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Application Configuration
NODE_ENV=production
PORT=5000
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=mongodb://localhost:27017/mgnrega-dashboard
```

### Environment Variables Explanation

| Variable | Description | Example |
|----------|-------------|---------|
| `UPSTASH_REDIS_URL` | Complete Upstash Redis URL | `redis://default:abc123@happy-shark-12345.upstash.io:6379` |
| `UPSTASH_REDIS_PASSWORD` | Upstash Redis password | `abc123def456` |
| `REDIS_URL` | Fallback Redis URL | `redis://localhost:6379` |
| `REDIS_HOST` | Fallback Redis host | `localhost` |
| `REDIS_PORT` | Fallback Redis port | `6379` |

## Code Implementation

The Redis configuration automatically detects and uses Upstash credentials:

### Connection Priority
1. **Primary**: Uses `UPSTASH_REDIS_URL` if available
2. **Secondary**: Falls back to `REDIS_URL`
3. **Tertiary**: Uses `REDIS_HOST` and `REDIS_PORT`

### Connection Features
- Automatic TLS for Upstash
- Connection retry logic
- Error handling and logging
- Health check monitoring

## Usage Examples

### Basic Redis Operations

```javascript
import redisService from './src/services/redisService.js';

// Set data with expiration
await redisService.set('user:123', { name: 'John', role: 'admin' }, 3600);

// Get data
const userData = await redisService.get('user:123', true); // true = parse JSON

// Cache API response
await redisService.cache('api:mgnrega:schemes', schemesData, 1800);

// Get cached data
const cachedSchemes = await redisService.getCache('api:mgnrega:schemes');
```

### Session Management

```javascript
// Store user session
await redisService.hset('session:abc123', 'userId', '64f7b1a2b3c4d5e6f7g8h9i0');
await redisService.hset('session:abc123', 'role', 'admin');
await redisService.expire('session:abc123', 3600); // 1 hour

// Get session data
const sessionData = await redisService.hgetall('session:abc123');
```

### Caching MGNREGA Data

```javascript
// Cache job cards
const cacheKey = `jobcards:state:${stateCode}:district:${districtCode}`;
await redisService.cache(cacheKey, jobCardsData, 1800); // 30 minutes

// Cache work progress
const workKey = `work:progress:${workId}`;
await redisService.cache(workKey, workProgress, 600); // 10 minutes

// Cache user statistics
const statsKey = `stats:user:${userId}:daily`;
await redisService.cache(statsKey, dailyStats, 86400); // 24 hours
```

## Rate Limiting

### Basic Rate Limiting Middleware

```javascript
import express from 'express';
import rateLimiter from './src/utils/rateLimiter.js';

const app = express();

// Apply rate limiting to all routes
app.use(rateLimiter.middleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  strategy: 'sliding' // sliding window algorithm
}));

// Specific rate limit for API endpoints
app.use('/api', rateLimiter.middleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  keyGenerator: (req) => `${req.ip}:${req.user?.id || 'anonymous'}`
}));

// Strict rate limit for auth endpoints
app.use('/api/auth', rateLimiter.middleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  strategy: 'fixed'
}));
```

### Advanced Rate Limiting

```javascript
// Token bucket for API with bursts
app.use('/api/data', rateLimiter.middleware({
  strategy: 'token',
  capacity: 50, // 50 tokens in bucket
  refillRate: 10, // 10 tokens per second
  keyGenerator: (req) => `api:${req.user?.id || req.ip}`
}));

// Custom rate limit check
const checkCustomLimit = async (userId) => {
  const result = await rateLimiter.checkRateLimit(
    `custom:${userId}`,
    3600000, // 1 hour
    20 // 20 requests per hour
  );
  
  if (!result.allowed) {
    throw new Error(`Rate limit exceeded. Try again in ${result.retryAfter} seconds`);
  }
  
  return result;
};
```

## Troubleshooting

### Common Issues

#### 1. Connection Timeout
```
Error: Connection timeout
```

**Solution**:
- Check if Upstash database is active
- Verify network connectivity
- Ensure correct endpoint URL
- Check firewall settings

#### 2. Authentication Failed
```
Error: NOAUTH Authentication required
```

**Solution**:
- Verify `UPSTASH_REDIS_PASSWORD` is correct
- Check if password is included in Redis URL
- Ensure URL format: `redis://default:password@host:port`

#### 3. TLS Connection Error
```
Error: self signed certificate
```

**Solution**:
- Ensure TLS is enabled in Redis config
- Update Node.js to latest version
- Set `socket.tls: true` in client configuration

### Health Check

```javascript
// Check Redis connection health
const healthCheck = async () => {
  try {
    const ping = await redisService.ping();
    const info = await redisService.info();
    console.log('✅ Redis Health Check Passed', { ping, connected: true });
    return { status: 'healthy', ping, connected: true };
  } catch (error) {
    console.error('❌ Redis Health Check Failed', error);
    return { status: 'unhealthy', error: error.message };
  }
};
```

### Debug Mode

Enable detailed logging by setting:

```env
NODE_ENV=development
LOG_LEVEL=debug
```

## Best Practices

### 1. Key Naming Conventions
```javascript
// Use consistent naming patterns
const userKey = `user:${userId}`;
const sessionKey = `session:${sessionId}`;
const cacheKey = `cache:api:${endpoint}:${params}`;
const rateLimitKey = `rate:${identifier}:${window}`;
```

### 2. TTL Management
```javascript
// Always set appropriate TTL
await redisService.set('temp:data', data, 300); // 5 minutes
await redisService.cache('api:response', response, 1800); // 30 minutes
```

### 3. Error Handling
```javascript
const safeRedisOperation = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    console.error('Redis operation failed:', error);
    // Graceful degradation - continue without cache
    return null;
  }
};
```

### 4. Connection Management
```javascript
// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await redisService.disconnect();
  process.exit(0);
});
```

### 5. Memory Optimization
```javascript
// Use appropriate data structures
await redisService.sadd('active:users', userId); // Sets for unique values
await redisService.lpush('recent:actions', action); // Lists for ordered data
await redisService.hset('user:profile', field, value); // Hashes for structured data
```

### 6. Security Best Practices
- Never expose Redis credentials in client-side code
- Use environment variables for all configuration
- Enable TLS for production deployments
- Implement proper authentication and authorization
- Regular password rotation

### 7. Performance Tips
- Use pipelining for multiple operations
- Implement proper caching strategies
- Monitor Redis memory usage
- Use appropriate data types for use cases
- Set reasonable TTL values

## Monitoring

### Key Metrics to Monitor
- Connection count
- Memory usage
- Operation latency
- Error rates
- Cache hit/miss ratios

### Health Check Endpoint
```javascript
app.get('/health/redis', async (req, res) => {
  try {
    const start = Date.now();
    await redisService.ping();
    const latency = Date.now() - start;
    
    res.json({
      status: 'healthy',
      service: 'redis',
      latency: `${latency}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'redis',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

## Migration from Local Redis

If migrating from local Redis to Upstash:

1. **Export existing data** (if needed):
   ```bash
   redis-cli --rdb dump.rdb
   ```

2. **Update environment variables**:
   ```env
   UPSTASH_REDIS_URL=your_upstash_url
   ```

3. **Test connection**:
   ```javascript
   await redisService.ping();
   ```

4. **Update application logic** (if needed):
   - Review key naming conventions
   - Check TTL settings
   - Verify data serialization

## Support

For issues related to:
- **Upstash**: [Upstash Support](https://upstash.com/docs)
- **Redis**: [Redis Documentation](https://redis.io/docs)
- **Application**: Check application logs and error messages

---

**Note**: Always test your Redis configuration in a development environment before deploying to production.