import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'default') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Global Toast Container */}
            <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <div key={t.id}
                        className={`pointer-events-auto px-5 py-3.5 rounded-xl shadow-2xl toast-pop border border-white/10 text-sm font-medium ${
                            t.type === 'error' ? 'bg-red-600 text-white' : 
                            t.type === 'success' ? 'bg-emerald-600 text-white' : 
                            'bg-[#0d0e17] text-white'
                        }`}>
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
