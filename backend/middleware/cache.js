
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; 
const cacheMiddleware = (duration = CACHE_DURATION) => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }
    const cacheKey = `${req.user?.id || 'anonymous'}_${req.originalUrl}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      const { data, timestamp } = cachedData;
      const isExpired = Date.now() - timestamp > duration;
      if (!isExpired) {
        return res.json(data);
      } else {
        cache.delete(cacheKey);
      }
    }
    const originalJson = res.json;
    res.json = function(data) {
      if (res.statusCode === 200) {
        cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }
      return originalJson.call(this, data);
    };
    next();
  };
};
const clearUserCache = (userId) => {
  const keysToDelete = [];
  for (const key of cache.keys()) {
    if (key.startsWith(`${userId}_`)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => cache.delete(key));
};
const clearAllCache = () => {
  cache.clear();
};
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
