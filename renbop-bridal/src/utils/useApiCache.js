import { useState, useEffect } from 'react';
import { apiClient } from './apiClient';

// A simple in-memory cache object
const cache = new Map();

/**
 * Custom hook to fetch data with local caching.
 * Provides immediate stale data from cache while fetching fresh data in the background.
 */
export function useApiCache(endpoint) {
    const [data, setData] = useState(() => cache.get(endpoint) || null);
    const [loading, setLoading] = useState(!cache.has(endpoint));
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            // If we don't have cached data, we show loading
            if (!cache.has(endpoint)) {
                setLoading(true);
            }
            
            try {
                const result = await apiClient(endpoint);
                if (isMounted) {
                    // Update cache and state
                    cache.set(endpoint, result.data || result);
                    setData(result.data || result);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    console.error('API Cache fetch error:', err);
                    setError(err.message || 'Lỗi tải dữ liệu');
                    // If we have stale cache, keep it, otherwise clear it
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (endpoint) {
            fetchData();
        }
        
        return () => {
            isMounted = false;
        };
    }, [endpoint]);

    return { data, loading, error };
}
