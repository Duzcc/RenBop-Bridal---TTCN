import { useState, useEffect } from 'react';
import { getSyncQueue, removeQueueItem } from '../utils/offlineDB';
import { apiClient } from '../utils/apiClient';
import { useToast } from '../context/ToastContext';

export const useOfflineSync = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncing, setSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const { showToast } = useToast();

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            syncQueue();
        };
        
        const handleOffline = () => {
            setIsOnline(false);
            showToast('📵 Đã mất kết nối mạng. Ứng dụng đang chạy ngoại tuyến.');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Check initial queue count
        updateQueueCount();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const updateQueueCount = async () => {
        try {
            const queue = await getSyncQueue();
            setPendingCount(queue.length);
        } catch (e) {
            console.error('Failed to get queue count', e);
        }
    };

    const syncQueue = async () => {
        try {
            const queue = await getSyncQueue();
            if (queue.length === 0) return;

            setSyncing(true);
            showToast(`🔄 Đang đồng bộ ${queue.length} thao tác...`);

            for (const item of queue) {
                try {
                    await apiClient(item.url, {
                        method: item.method,
                        body: item.body
                    });
                    await removeQueueItem(item.id);
                } catch (err) {
                    console.error('Sync failed for item', item, err);
                }
            }

            updateQueueCount();
            showToast('✅ Đồng bộ ngoại tuyến hoàn tất!');
        } catch (err) {
            console.error('Queue processing failed', err);
        } finally {
            setSyncing(false);
        }
    };

    return { isOnline, syncing, pendingCount, updateQueueCount };
};
