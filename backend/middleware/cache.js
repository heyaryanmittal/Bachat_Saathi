// ===============================
// Simple In-Memory Cache Middleware
// ===============================
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache middleware for GET requests
const cacheMiddleware = (duration = CACHE_DURATION) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create cache key from URL and user ID
    const cacheKey = `${req.user?.id || 'anonymous'}_${req.originalUrl}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      const { data, timestamp } = cachedData;
      const isExpired = Date.now() - timestamp > duration;

      if (!isExpired) {
        console.log(`Cache HIT for ${cacheKey}`);
        return res.json(data);
      } else {
        // Remove expired cache
        cache.delete(cacheKey);
      }
    }

    // Store original res.json
    const originalJson = res.json;

    // Override res.json to cache the response
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        console.log(`Cache SET for ${cacheKey}`);
        cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

// Clear cache for specific user (useful after data modifications)
const clearUserCache = (userId) => {
  const keysToDelete = [];
  for (const key of cache.keys()) {
    if (key.startsWith(`${userId}_`)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => cache.delete(key));
  console.log(`Cleared ${keysToDelete.length} cache entries for user ${userId}`);
};

// Clear all cache
const clearAllCache = () => {
  cache.clear();
  console.log('Cleared all cache');
};

// Get cache stats
const getCacheStats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
};

module.exports = {
  cacheMiddleware,
  clearUserCache,
  clearAllCache,
  getCacheStats
};
