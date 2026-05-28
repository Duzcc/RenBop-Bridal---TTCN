import { openDB } from 'idb';

const DB_NAME = 'renbop-offline-db';
const STORE_NAME = 'sync-queue';

export const initDB = async () => {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        },
    });
};

export const enqueueRequest = async (url, options) => {
    const db = await initDB();
    await db.add(STORE_NAME, {
        url,
        options,
        timestamp: Date.now(),
    });
    console.log('[Offline] Request enqueued:', url);
};

export const getQueue = async () => {
    const db = await initDB();
    return db.getAll(STORE_NAME);
};

export const clearQueue = async () => {
    const db = await initDB();
    await db.clear(STORE_NAME);
};

export const removeRequest = async (id) => {
    const db = await initDB();
    await db.delete(STORE_NAME, id);
};

export const processQueue = async (apiClient) => {
    if (!navigator.onLine) return;
    
    const queue = await getQueue();
    if (queue.length === 0) return;

    console.log(`[Sync] Processing ${queue.length} offline requests...`);
    
    for (const req of queue) {
        try {
            // Attempt to send
            await apiClient(req.url, req.options);
            await removeRequest(req.id);
            console.log(`[Sync] Successfully synced: ${req.url}`);
        } catch (error) {
            console.error(`[Sync] Failed to sync: ${req.url}`, error);
            // If it's a 4xx error (except 401/403 maybe), it might never succeed, but we keep it simple
            // We could optionally remove it if we know it's a permanent failure
        }
    }
};
