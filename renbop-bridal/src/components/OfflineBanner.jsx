import { useState, useEffect } from 'react';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { WifiOff, RefreshCw } from 'lucide-react';

const OfflineBanner = () => {
    const { isOnline, syncing, pendingCount } = useOfflineSync();
    
    // Don't show banner if online and no pending syncs
    if (isOnline && pendingCount === 0 && !syncing) return null;

    return (
        <div className={`fixed bottom-4 left-4 z-50 p-4 rounded-xl shadow-xl flex items-center space-x-4
            ${isOnline ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
            animate-fade-in-up`}
        >
            {isOnline ? (
                <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            ) : (
                <WifiOff className="w-5 h-5 animate-pulse" />
            )}
            
            <div>
                <p className="font-bold text-sm">
                    {isOnline ? (syncing ? 'Đang đồng bộ dữ liệu...' : 'Sẵn sàng đồng bộ') : 'Đang ở chế độ Ngoại Tuyến'}
                </p>
                <p className="text-xs opacity-90">
                    {pendingCount > 0 
                        ? `Có ${pendingCount} thao tác đang chờ đồng bộ.` 
                        : (isOnline ? '' : 'Dữ liệu sẽ được lưu cục bộ.')}
                </p>
            </div>
        </div>
    );
};

export default OfflineBanner;
