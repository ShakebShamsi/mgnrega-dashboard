import redisService from '../services/redisService.js';
import rateLimiter from './rateLimiter.js';

/**
 * Redis Connection Test Utility
 * Comprehensive testing suite for Redis functionality
 */
class RedisTestUtil {
  constructor() {
    this.results = [];
    this.startTime = null;
  }

  /**
   * Log test result
   * @param {string} testName - Name of the test
   * @param {boolean} passed - Whether test passed
   * @param {string} [message] - Additional message
   * @param {any} [data] - Test data
   */
  logResult(testName, passed, message = '', data = null) {
    const result = {
      test: testName,
      passed,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    this.results.push(result);

    const status = passed ? '✅ PASS' : '❌ FAIL';
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
    console.log(`${status} | ${testName} | ${message}${dataStr}`);
  }

  /**
   * Test basic Redis connection
   */
  async testConnection() {
    try {
      const pingResult = await redisService.ping();
      this.logResult(
        'Connection Test',
        pingResult === 'PONG',
        `Ping response: ${pingResult}`
      );
      return pingResult === 'PONG';
    } catch (error) {
      this.logResult(
        'Connection Test',
        false,
        `Connection failed: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Test Redis info command
   */
  async testInfo() {
    try {
      const info = await redisService.info();
      const hasMemory = info.includes('used_memory');
      this.logResult(
        'Info Command Test',
        hasMemory,
        hasMemory ? 'Redis info retrieved successfully' : 'Invalid info response'
      );
      return hasMemory;
    } catch (error) {
      this.logResult(
        'Info Command Test',
        false,
        `Info command failed: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Test basic SET/GET operations
   */
  async testBasicOperations() {
    const testKey = 'test:basic:key';
    const testValue = 'test-value-123';

    try {
      // Test SET
      await redisService.set(testKey, testValue);

      // Test GET
      const retrievedValue = await redisService.get(testKey);

      const success = retrievedValue === testValue;
      this.logResult(
        'Basic SET/GET Test',
        success,
        success ? 'Basic operations working' : `Expected ${testValue}, got ${retrievedValue}`
      );

      // Cleanup
      await redisService.del(testKey);

      return success;
    } catch (error) {
      this.logResult(
        'Basic SET/GET Test',
        false,
        `Basic operations failed: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Test JSON serialization/deserialization
   */
  async testJSONOperations() {
    const testKey = 'test:json:key';
    const testObject = {
      id: 123,
      name: 'MGNREGA Test',
      data: {
        schemes: ['NREGA', 'Rural Employment'],
        count: 42
      }
    };

    try {
      // Set JSON object
      await redisService.set(testKey, testObject, 60);

      // Get as JSON
      const retrievedObject = await redisService.get(testKey, true);

      const success = JSON.stringify(retrievedObject) === JSON.stringify(testObject);
      this.logResult(
        'JSON Operations Test',
        success,
        success ? 'JSON serialization working' : 'JSON mismatch',
        { original: testObject, retrieved: retrievedObject }
      );

      // Cleanup
      await redisService.del(testKey);

      return success;
    } catch (error) {
      this.logResult(
        'JSON Operations Test',
        false,
        `JSON operations failed: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Test TTL (Time To Live) functionality
   */
  async testTTL() {
    const testKey = 'test:ttl:key';
    const testValue = 'expires-soon';
    const ttlSeconds = 5;

    try {
      // Set with TTL
      await redisService.set(testKey, testValue, ttlSeconds);

      // Check TTL
      const initialTTL = await redisService.ttl(testKey);
      const hasValidTTL = initialTTL > 0 && initialTTL <= ttlSeconds;

      this.logResult(
        'TTL Test',
        hasValidTTL,
        hasValidTTL ? `TTL set correctly: ${initialTTL}s` : `Invalid TTL: ${initialTTL}`,
        { expectedTTL: ttlSeconds, actualTTL: initialTTL }
      );

      // Cleanup
      await redisService.del(testKey);

      return hasValidTTL;
    } catch (error) {
      this.logResult(
        'TTL Test',
        false,
        `TTL test failed: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Test Hash operations (HSET/HGET)
   */
  async testHashOperations() {
    const hashKey = 'test:hash:user:123';
    const testData = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    };

    try {
      // Set hash fields
      for (const [field, value] of Object.entries(testData)) {
        await redisService.hset(hashKey, field, value);
      }

      // Get all hash data
      const retrievedData = await redisService.hgetall(hashKey);

      const success = Object.keys(testData).every(key => retrievedData[key] === testData[key]);
      this.logResult(
        'Hash Operations Test',
        success,
        success ? 'Hash operations working' : 'Hash data mismatch',
        { original: testData, retrieved: retrievedData }
      );

      // Cleanup
      await redisService.del(hashKey);

      return success;
    } catch (error) {
      this.logResult(
        'Hash Operations Test',
        false,
        `Hash operations failed: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Test Set operations (SADD/SMEMBERS)
   */
  async testSetOperations() {
    const setKey = 'test:set:tags';
    const testMembers = ['tag1', 'tag2', 'tag3'];

    try {
      // Add members to set
      await redisService.sadd(setKey, testMembers);

      // Get all members
      const retrievedMembers = await redisService.smembers(setKey);

      const success = testMembers.every(member => retrievedMembers.includes(member));
      this.logResult(
        'Set Operations Test',
        success,
        success ? 'Set operations working' : 'Set members mismatch',
        { original: testMembers, retrieved: retrievedMembers }
      );

      // Cleanup
      await redisService.del(setKey);

      return success;
    } catch (error) {
      this.logResult(
        'Set Operations Test',
        false,
        `Set operations failed: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Test caching utility functions
   */
  async testCacheOperations() {
    const cacheKey = 'test:cache:mgnrega:schemes';
    const cacheData = {
      schemes: [
        { id: 1, name: 'NREGA', status: 'active' },
        { id: 2, name: 'Rural Roads', status: 'active' }
      ],
      timestamp: Date.now()
    };

    try {
      // Cache data
      await redisService.cache(cacheKey, cacheData, 60);

      // Get cached data
      const retrievedData = await redisService.getCache(cacheKey);

      const success = JSON.stringify(retrievedData) === JSON.stringify(cacheData);
      this.logResult(
        'Cache Operations Test',
        success,
        success ? 'Cache operations working' : 'Cache data mismatch'
      );

      // Cleanup
      await redisService.del(cacheKey);

      return success;
    } catch (error) {
      this.logResult(
        'Cache Operations Test',
        false,
        `Cache operations failed: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Test rate limiter functionality
   */
  async testRateLimiter() {
    const identifier = 'test:user:123';
    const windowMs = 1000; // 1 second
    const maxRequests = 3;

    try {
      let allPassed = true;

      // Test initial requests (should be allowed)
      for (let i = 1; i <= maxRequests; i++) {
        const result = await rateLimiter.checkRateLimit(identifier, windowMs, maxRequests);
        if (!result.allowed) {
          allPassed = false;
          break;
        }
      }

      // Test rate limit exceeded
      const blockedResult = await rateLimiter.checkRateLimit(identifier, windowMs, maxRequests);
      const rateLimitWorking = !blockedResult.allowed;

      const success = allPassed && rateLimitWorking;
      this.logResult(
        'Rate Limiter Test',
        success,
        success ? 'Rate limiter working correctly' : 'Rate limiter not working',
        {
          maxRequests,
          finalCount: blockedResult.count,
          blocked: !blockedResult.allowed
        }
      );

      // Cleanup
      await rateLimiter.clearRateLimit(identifier);

      return success;
    } catch (error) {
      this.logResult(
        'Rate Limiter Test',
        false,
        `Rate limiter test failed: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Test error handling and resilience
   */
  async testErrorHandling() {
    try {
      // Test invalid key operations
      const result = await redisService.get('non:existent:key');
      const success = result === null;

      this.logResult(
        'Error Handling Test',
        success,
        success ? 'Handles missing keys correctly' : 'Error handling issue'
      );

      return success;
    } catch (error) {
      this.logResult(
        'Error Handling Test',
        false,
        `Error handling test failed: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Performance benchmark test
   */
  async testPerformance() {
    const iterations = 100;
    const testKey = 'test:performance';

    try {
      const startTime = Date.now();

      // Perform multiple SET operations
      for (let i = 0; i < iterations; i++) {
        await redisService.set(`${testKey}:${i}`, `value-${i}`);
      }

      // Perform multiple GET operations
      for (let i = 0; i < iterations; i++) {
        await redisService.get(`${testKey}:${i}`);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / (iterations * 2);

      const success = avgTime < 50; // Less than 50ms average is good
      this.logResult(
        'Performance Test',
        success,
        `${iterations * 2} operations in ${totalTime}ms (avg: ${avgTime.toFixed(2)}ms)`,
        { totalTime, avgTime, operations: iterations * 2 }
      );

      // Cleanup
      for (let i = 0; i < iterations; i++) {
        await redisService.del(`${testKey}:${i}`);
      }

      return success;
    } catch (error) {
      this.logResult(
        'Performance Test',
        false,
        `Performance test failed: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('\n🧪 Starting Redis Test Suite...\n');
    this.startTime = Date.now();

    const tests = [
      { name: 'Connection', fn: () => this.testConnection() },
      { name: 'Info Command', fn: () => this.testInfo() },
      { name: 'Basic Operations', fn: () => this.testBasicOperations() },
      { name: 'JSON Operations', fn: () => this.testJSONOperations() },
      { name: 'TTL Functionality', fn: () => this.testTTL() },
      { name: 'Hash Operations', fn: () => this.testHashOperations() },
      { name: 'Set Operations', fn: () => this.testSetOperations() },
      { name: 'Cache Operations', fn: () => this.testCacheOperations() },
      { name: 'Rate Limiter', fn: () => this.testRateLimiter() },
      { name: 'Error Handling', fn: () => this.testErrorHandling() },
      { name: 'Performance', fn: () => this.testPerformance() }
    ];

    let passedTests = 0;

    for (const test of tests) {
      try {
        const passed = await test.fn();
        if (passed) passedTests++;
      } catch (error) {
        this.logResult(test.name, false, `Test threw error: ${error.message}`);
      }
    }

    const endTime = Date.now();
    const totalTime = endTime - this.startTime;

    console.log('\n📊 Test Results Summary:');
    console.log(`Total Tests: ${tests.length}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${tests.length - passedTests}`);
    console.log(`Success Rate: ${((passedTests / tests.length) * 100).toFixed(1)}%`);
    console.log(`Total Time: ${totalTime}ms\n`);

    return {
      total: tests.length,
      passed: passedTests,
      failed: tests.length - passedTests,
      successRate: (passedTests / tests.length) * 100,
      totalTime,
      results: this.results
    };
  }

  /**
   * Get detailed test report
   */
  getDetailedReport() {
    return {
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length
      },
      results: this.results,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Quick test function for development
 */
export const quickTest = async () => {
  console.log('🚀 Quick Redis Test...');

  try {
    // Test connection
    const ping = await redisService.ping();
    console.log(`✅ Connection: ${ping}`);

    // Test basic operation
    await redisService.set('test:quick', 'working', 10);
    const value = await redisService.get('test:quick');
    console.log(`✅ Basic Operation: ${value}`);

    // Cleanup
    await redisService.del('test:quick');

    console.log('✅ Quick test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
    return false;
  }
};

/**
 * Health check function for monitoring
 */
export const healthCheck = async () => {
  try {
    const start = Date.now();
    await redisService.ping();
    const latency = Date.now() - start;

    return {
      status: 'healthy',
      service: 'redis',
      latency: `${latency}ms`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      service: 'redis',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Export test utility class
export default RedisTestUtil;

// CLI execution if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testUtil = new RedisTestUtil();

  // Handle command line arguments
  const command = process.argv[2];

  switch (command) {
    case 'quick':
      await quickTest();
      break;
    case 'health':
      const health = await healthCheck();
      console.log(JSON.stringify(health, null, 2));
      break;
    case 'full':
    default:
      await testUtil.runAllTests();
      break;
  }

  process.exit(0);
}
