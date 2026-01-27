using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Text.Json;
using MentorPlatform.Application.Services.Caching;

namespace MentorPlatform.Infrastructure.Caching;

public class CacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private readonly IConnectionMultiplexer? _redis;
    private readonly ILogger<CacheService> _logger;

    public CacheService(
        IDistributedCache cache,
        ILogger<CacheService> logger,
        IConnectionMultiplexer? redis = null)
    {
        _cache = cache;
        _logger = logger;
        _redis = redis;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var data = await _cache.GetStringAsync(key, cancellationToken);
            
            if (string.IsNullOrEmpty(data))
                return default;

            return JsonSerializer.Deserialize<T>(data);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to retrieve cache key: {Key}", key);
            return default;
        }
    }

    public async Task SetAsync<T>(
        string key,
        T value,
        TimeSpan? absoluteExpiration = null,
        TimeSpan? slidingExpiration = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = absoluteExpiration ?? TimeSpan.FromHours(1),
                SlidingExpiration = slidingExpiration ?? TimeSpan.FromMinutes(30)
            };

            var serialized = JsonSerializer.Serialize(value);
            await _cache.SetStringAsync(key, serialized, options, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to set cache key: {Key}", key);
            // Fail silently - cache failures shouldn't break the application
        }
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            await _cache.RemoveAsync(key, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to remove cache key: {Key}", key);
        }
    }

    public async Task<T?> GetOrSetAsync<T>(
        string key,
        Func<Task<T>> factory,
        TimeSpan? absoluteExpiration = null,
        TimeSpan? slidingExpiration = null,
        CancellationToken cancellationToken = default)
    {
        var cached = await GetAsync<T>(key, cancellationToken);
        if (cached is not null) return cached;

        var value = await factory();
        if (value is not null)
            await SetAsync(key, value, absoluteExpiration, slidingExpiration, cancellationToken);

        return value;
    }

    public async Task RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default)
    {
        try
        {
            if (_redis != null)
            {
                // Use Redis SCAN for efficient prefix deletion
                var db = _redis.GetDatabase();
                var server = _redis.GetServer(_redis.GetEndPoints().First());

                var pattern = $"{prefix}*";
                var keys = server.Keys(pattern: pattern, pageSize: 1000);

                var tasks = keys.Select(key => db.KeyDeleteAsync(key));
                await Task.WhenAll(tasks);

                _logger.LogInformation("Removed {Count} keys with prefix: {Prefix}", keys.Count(), prefix);
            }
            else
            {
                // Fallback for non-Redis distributed cache
                await _cache.RemoveAsync(prefix, cancellationToken);
                _logger.LogWarning("RemoveByPrefix called without Redis connection. Only removed exact key: {Prefix}", prefix);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to remove cache keys by prefix: {Prefix}", prefix);
        }
    }

    public async Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            if (_redis != null)
            {
                var db = _redis.GetDatabase();
                return await db.KeyExistsAsync(key);
            }

            var data = await _cache.GetStringAsync(key, cancellationToken);
            return !string.IsNullOrEmpty(data);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to check cache key existence: {Key}", key);
            return false;
        }
    }

    public async Task<long> RemoveMultipleAsync(IEnumerable<string> keys, CancellationToken cancellationToken = default)
    {
        try
        {
            if (_redis != null)
            {
                var db = _redis.GetDatabase();
                var redisKeys = keys.Select(k => (RedisKey)k).ToArray();
                return await db.KeyDeleteAsync(redisKeys);
            }

            // Fallback for non-Redis
            var tasks = keys.Select(k => _cache.RemoveAsync(k, cancellationToken));
            await Task.WhenAll(tasks);
            return keys.Count();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to remove multiple cache keys");
            return 0;
        }
    }
}
