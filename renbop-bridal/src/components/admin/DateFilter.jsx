import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const PRESETS = [
    { id: 'ALL', label: 'Tất cả thời gian' },
    { id: 'TODAY', label: 'Hôm nay' },
    { id: 'YESTERDAY', label: 'Hôm qua' },
    { id: 'THIS_WEEK', label: 'Tuần này' },
    { id: 'THIS_MONTH', label: 'Tháng này' },
    { id: 'CUSTOM', label: 'Tùy chỉnh' }
];

const formatDate = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

const DateFilter = ({ onFilterChange, className = '' }) => {
    const [preset, setPreset] = useState('ALL');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        let from = '';
        let to = '';
        const today = new Date();

        switch (preset) {
            case 'TODAY':
                from = formatDate(today);
                to = formatDate(today);
                break;
            case 'YESTERDAY':
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                from = formatDate(yesterday);
                to = formatDate(yesterday);
                break;
            case 'THIS_WEEK':
                const startOfWeek = new Date(today);
                const day = startOfWeek.getDay();
                const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
                startOfWeek.setDate(diff);
                from = formatDate(startOfWeek);
                to = formatDate(today);
                break;
            case 'THIS_MONTH':
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                from = formatDate(startOfMonth);
                to = formatDate(today);
                break;
            case 'ALL':
                from = '';
                to = '';
                break;
            case 'CUSTOM':
                from = fromDate;
                to = toDate;
                break;
            default:
                break;
        }

        if (preset !== 'CUSTOM') {
            setFromDate(from);
            setToDate(to);
            onFilterChange({ fromDate: from, toDate: to });
        }
    }, [preset]);

    // Handle custom date changes
    useEffect(() => {
        if (preset === 'CUSTOM') {
            onFilterChange({ fromDate, toDate });
        }
    }, [fromDate, toDate, preset]);

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative">
                <select 
                    value={preset} 
                    onChange={e => setPreset(e.target.value)}
                    className="appearance-none bg-[#f8f8fc] border border-transparent rounded-lg text-[12px] font-bold text-[#0d0e17] px-3 py-1.5 pr-7 outline-none hover:bg-[#f0f0f5] cursor-pointer transition-all"
                >
                    {PRESETS.map(p => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9999b0] pointer-events-none" />
            </div>

            {preset === 'CUSTOM' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                    <input 
                        type="date" 
                        value={fromDate} 
                        onChange={e => setFromDate(e.target.value)}
                        className="bg-[#f8f8fc] border border-transparent rounded-lg text-[12px] font-bold text-[#0d0e17] px-2 py-1.5 outline-none hover:bg-[#f0f0f5] transition-all" 
                        title="Từ ngày" 
                    />
                    <span className="text-[#9999b0] text-[12px]">-</span>
                    <input 
                        type="date" 
                        value={toDate} 
                        onChange={e => setToDate(e.target.value)}
                        className="bg-[#f8f8fc] border border-transparent rounded-lg text-[12px] font-bold text-[#0d0e17] px-2 py-1.5 outline-none hover:bg-[#f0f0f5] transition-all" 
                        title="Đến ngày" 
                    />
                </div>
            )}
        </div>
    );
};

export default DateFilter;
