import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../../utils/apiClient';
import DateFilter from '../../components/admin/DateFilter';
import { useToast } from '../../context/ToastContext';
import { Clock, RotateCcw, User, Tag, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [expandedLog, setExpandedLog] = useState(null);
    const [revertingId, setRevertingId] = useState(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await apiClient('/admin/audit-logs/timeline');
            if (res.success) {
                setLogs(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching logs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUndo = async (logId) => {
        if (!window.confirm('Bạn có chắc chắn muốn hoàn tác (Undo) hành động này?')) return;
        
        setRevertingId(logId);
        try {
            const res = await apiClient(`/admin/audit-logs/${logId}/undo`, {
                method: 'POST'
            });
            if (res.success) {
                showToast('✅ Đã hoàn tác thành công!');
                // Update local state to reflect revert
                setLogs(prev => prev.map(l => l.id === logId ? { ...l, isReverted: true } : l));
            }
        } catch (error) {
            showToast(`❌ Không thể hoàn tác: ${error.message || 'Lỗi hệ thống'}`);
        } finally {
            setRevertingId(null);
        }
    };

    const formatAction = (actionStr) => {
        if (actionStr.includes('UPDATESTATUS')) return 'Cập nhật trạng thái';
        if (actionStr.includes('DELETE')) return 'Xóa dữ liệu';
        if (actionStr.includes('CREATE') || actionStr.includes('POST')) return 'Tạo mới';
        if (actionStr.includes('UPDATE') || actionStr.includes('PUT')) return 'Chỉnh sửa';
        return actionStr;
    };

    const getActionColor = (actionStr) => {
        if (actionStr.includes('DELETE')) return 'bg-red-500';
        if (actionStr.includes('CREATE') || actionStr.includes('POST')) return 'bg-emerald-500';
        if (actionStr.includes('UPDATE') || actionStr.includes('PUT')) return 'bg-blue-500';
        return 'bg-[#c9a96e]';
    };

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            if (fromDate || toDate) {
                const lDate = new Date(log.createdAt);
                if (!isNaN(lDate.getTime())) {
                    const lDateStr = lDate.toISOString().split('T')[0];
                    if (fromDate && lDateStr < fromDate) return false;
                    if (toDate && lDateStr > toDate) return false;
                }
            }
            return true;
        });
    }, [logs, fromDate, toDate]);

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#c9a96e] border-t-transparent" />
        </div>
    );

    return (
        <div className="max-w-[1000px] mx-auto px-6 py-8 font-sans">
            <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#0d0e17] tracking-tight mb-2">Nhật ký hoạt động (Timeline)</h1>
                    <p className="text-[#6b6b80] font-medium">Theo dõi chi tiết các thay đổi dữ liệu trong hệ thống và hỗ trợ Undo/Redo.</p>
                </div>
                <div className="flex items-center bg-white border border-[#e8e8f0] rounded-xl p-1.5 shadow-sm">
                    <DateFilter onFilterChange={({ fromDate, toDate }) => { setFromDate(fromDate); setToDate(toDate); }} />
                </div>
            </div>

            <div className="relative border-l-2 border-[#e8e8f0] ml-6 pl-8 space-y-8 py-4">
                {filteredLogs.map((log) => (
                    <div key={log.id} className="relative group">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[41px] w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-transform group-hover:scale-125 ${getActionColor(log.action)}`} />

                        <div className={`bg-white rounded-2xl border ${log.isReverted ? 'border-red-200 bg-red-50/30' : 'border-[#e8e8f0]'} shadow-sm p-5 transition-all hover:shadow-md`}>
                            
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[12px] font-black uppercase tracking-widest text-[#0d0e17] bg-[#f8f8fc] px-2 py-1 rounded-md">
                                            {formatAction(log.action)}
                                        </span>
                                        <span className="text-[12px] font-bold text-[#c9a96e]">
                                            {log.entityName} #{log.entityId || ''}
                                        </span>
                                        {log.isReverted && (
                                            <span className="text-[10px] font-black uppercase text-red-500 flex items-center gap-1 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                                                <RotateCcw size={10} /> Đã hoàn tác
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[14px] text-[#0d0e17] font-medium mb-3">
                                        <span className="font-bold text-blue-600">{log.userEmail}</span> đã thực hiện thao tác trên hệ thống.
                                    </p>
                                    
                                    <div className="flex items-center gap-4 text-[12px] font-bold text-[#9999b0]">
                                        <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(log.createdAt).toLocaleString('vi-VN')}</span>
                                        <span className="flex items-center gap-1.5"><Tag size={14} /> {log.ipAddress}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <button 
                                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                        className="p-2 bg-[#f8f8fc] hover:bg-[#e8e8f0] rounded-xl text-[#6b6b80] transition-colors"
                                    >
                                        <ChevronDown size={18} className={`transition-transform duration-300 ${expandedLog === log.id ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Details & Undo */}
                            {expandedLog === log.id && (
                                <div className="mt-5 pt-5 border-t border-[#f4f4f8] animate-in slide-in-from-top-2 duration-200">
                                    <div className="grid grid-cols-2 gap-4 mb-5">
                                        <div className="bg-[#f8f8fc] p-4 rounded-xl border border-[#e8e8f0]">
                                            <h4 className="text-[11px] font-black uppercase tracking-widest text-[#9999b0] mb-2">Giá trị trước đó (Previous Value)</h4>
                                            <pre className="text-[11px] font-mono text-[#0d0e17] overflow-x-auto whitespace-pre-wrap max-h-[150px] admin-scroll">
                                                {log.previousValue ? JSON.stringify(JSON.parse(log.previousValue), null, 2) : 'N/A'}
                                            </pre>
                                        </div>
                                        <div className="bg-[#f8f8fc] p-4 rounded-xl border border-[#e8e8f0]">
                                            <h4 className="text-[11px] font-black uppercase tracking-widest text-[#9999b0] mb-2">Giá trị mới (New Value)</h4>
                                            <pre className="text-[11px] font-mono text-[#0d0e17] overflow-x-auto whitespace-pre-wrap max-h-[150px] admin-scroll">
                                                {log.newValue ? JSON.stringify(JSON.parse(log.newValue), null, 2) : 'N/A'}
                                            </pre>
                                        </div>
                                    </div>

                                    {!log.isReverted && log.previousValue && (
                                        <div className="flex justify-end">
                                            <button 
                                                onClick={() => handleUndo(log.id)}
                                                disabled={revertingId === log.id}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl font-black text-[12px] transition-all disabled:opacity-50"
                                            >
                                                {revertingId === log.id ? <div className="animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full" /> : <RotateCcw size={14} />}
                                                Hoàn tác thao tác này (Undo)
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                ))}

                {filteredLogs.length === 0 && (
                    <div className="text-center py-10 text-[#9999b0] font-medium text-[14px]">
                        Chưa có nhật ký hoạt động nào.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
