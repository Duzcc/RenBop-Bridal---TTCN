// IndexedDB wrapper for Offline Mode
const DB_NAME = 'renbop-offline-db';
const DB_VERSION = 1;
const QUEUE_STORE = 'sync-queue';
const CACHE_STORE = 'api-cache';

let db;

export const initOfflineDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (e) => {
            console.error('IndexedDB error:', e.target.error);
            reject(e.target.error);
        };

        request.onsuccess = (e) => {
            db = e.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (e) => {
            const upgradeDb = e.target.result;
            if (!upgradeDb.objectStoreNames.contains(QUEUE_STORE)) {
                upgradeDb.createObjectStore(QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
            }
            if (!upgradeDb.objectStoreNames.contains(CACHE_STORE)) {
                upgradeDb.createObjectStore(CACHE_STORE, { keyPath: 'url' });
            }
        };
    });
};

export const queueAction = async (method, url, body) => {
    if (!db) await initOfflineDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(QUEUE_STORE, 'readwrite');
        const store = tx.objectStore(QUEUE_STORE);
        const action = {
            method,
            url,
            body,
            timestamp: Date.now()
        };
        const request = store.add(action);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const getSyncQueue = async () => {
    if (!db) await initOfflineDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(QUEUE_STORE, 'readonly');
        const store = tx.objectStore(QUEUE_STORE);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const removeQueueItem = async (id) => {
    if (!db) await initOfflineDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(QUEUE_STORE, 'readwrite');
        const store = tx.objectStore(QUEUE_STORE);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};
