// Cached data fetch
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to fetch data and cache it in sessionStorage.
 * @param {string} cacheKey - A unique key for this data in sessionStorage (e.g., the URL or a descriptive name like 'allProducts').
 * @param {string} url - The URL to fetch data from (e.g., '/data/products.json').
 * @param {object} [options={}] - Optional settings.
 * @param {number} [options.cacheDuration=300000] - Duration in milliseconds to keep cache valid (default: 5 minutes).
 * @returns {{ data: any, loading: boolean, error: Error|null, forceRefetch: function }}
 */
export function useFetchCached(cacheKey, url, options = {}) {
  const { cacheDuration = 5 * 60 * 1000 } = options; // Default 5 minutes

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetchIndex, setRefetchIndex] = useState(0); // To trigger refetch

  const forceRefetch = useCallback(() => {
    // Clear cache for this key and then trigger a refetch by updating refetchIndex
    try {
      sessionStorage.removeItem(cacheKey);
    } catch (e) {
      console.warn(`useFetchCached: Could not remove item from sessionStorage for key "${cacheKey}"`, e);
    }
    setRefetchIndex(prevIndex => prevIndex + 1);
  }, [cacheKey]);


  useEffect(() => {
    let isMounted = true; // To prevent state updates on unmounted component
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      // 1. Try to get data from sessionStorage
      try {
        const cachedItemString = sessionStorage.getItem(cacheKey);
        if (cachedItemString) {
          const cachedItem = JSON.parse(cachedItemString);
          const currentTime = new Date().getTime();

          if (cachedItem.timestamp && (currentTime - cachedItem.timestamp < cacheDuration)) {
            // Cache is valid
            if (isMounted) {
              setData(cachedItem.data);
              setLoading(false);
            }
            console.log(`useFetchCached: Serving data for "${cacheKey}" from cache.`);
            return; // Exit if serving from cache
          } else {
            // Cache expired or no timestamp
            console.log(`useFetchCached: Cache for "${cacheKey}" expired or invalid.`);
            sessionStorage.removeItem(cacheKey);
          }
        }
      } catch (e) {
        console.warn(`useFetchCached: Could not retrieve or parse item from sessionStorage for key "${cacheKey}"`, e);
        // Proceed to fetch if cache is problematic
      }

      // 2. If no valid cache, fetch data
      console.log(`useFetchCached: Fetching data for "${cacheKey}" from URL: ${url}`);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} for ${url}`);
        }
        const fetchedData = await response.json();

        if (isMounted) {
          setData(fetchedData);
          // Store in sessionStorage with a timestamp
          try {
            const itemToCache = {
              data: fetchedData,
              timestamp: new Date().getTime(),
            };
            sessionStorage.setItem(cacheKey, JSON.stringify(itemToCache));
            console.log(`useFetchCached: Data for "${cacheKey}" cached.`);
          } catch (e) {
            console.warn(`useFetchCached: Could not set item in sessionStorage for key "${cacheKey}"`, e);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error(`useFetchCached: Error fetching data for "${cacheKey}" from ${url}:`, err);
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Cleanup function to set isMounted to false when component unmounts
    };
  }, [url, cacheKey, cacheDuration, refetchIndex]); // Re-run effect if url, cacheKey, cacheDuration, or refetchIndex changes

  return { data, loading, error, forceRefetch };
}

/**
 * Utility function to manually invalidate/clear a specific cache entry.
 * @param {string} cacheKey - The key of the cache entry to clear.
 */
export const invalidateCacheEntry = (cacheKey) => {
    try {
      sessionStorage.removeItem(cacheKey);
      console.log(`useFetchCached: Manually invalidated cache for key "${cacheKey}".`);
    } catch (e) {
      console.warn(`useFetchCached: Could not remove item from sessionStorage for key "${cacheKey}" during manual invalidation`, e);
    }
};
