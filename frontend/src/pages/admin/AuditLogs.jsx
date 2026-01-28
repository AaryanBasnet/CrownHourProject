import { useState } from 'react';
import { useAuditLogs } from '../../hooks/useAdmin';
import { Filter, AlertCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import {
    AdminPageHeader,
    AdminCard,
    AdminSearch,
    AdminFilter,
    AdminBadge,
    Pagination
} from '../../components/admin/common/AdminComponents';

/**
 * Audit Logs Page
 * Admin page for viewing system audit logs
 * Luxury Light Theme Implementation
 */

const AuditLogs = () => {
    const [page, setPage] = useState(1);
    const [eventType, setEventType] = useState('');
    const [search, setSearch] = useState('');
    const limit = 20;

    const { data, isLoading, error } = useAuditLogs({ page, limit, eventType, search });

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                <h2 className="text-2xl font-bold mb-2">Error Loading Audit Logs</h2>
                <p>{error.message}</p>
            </div>
        );
    }

    const logs = data?.logs || [];
    const pagination = data?.pagination || {};

    const eventTypes = [
        { value: '', label: 'All Events' },
        { value: 'login_success', label: 'Login Success' },
        { value: 'login_failure', label: 'Login Failed' },
        { value: 'logout', label: 'Logout' },
        { value: 'password_change', label: 'Password Changed' },
        { value: 'user_created', label: 'User Created' },
        { value: 'user_status_updated', label: 'User Status Updated' },
        { value: 'user_deleted', label: 'User Deleted' },
        { value: 'order_created', label: 'Order Created' },
        { value: 'order_status_updated', label: 'Order Status Updated' },
        { value: 'order_cancelled', label: 'Order Cancelled' },
        { value: 'payment_completed', label: 'Payment Completed' },
        { value: 'review_status_updated', label: 'Review Status Updated' },
        { value: 'review_deleted', label: 'Review Deleted' },
        { value: 'mfa_verify_success', label: 'MFA Verified' },
        { value: 'mfa_verify_failure', label: 'MFA Failed' },
        { value: 'unauthorized_access', label: 'Unauthorized Access' },
    ];

    const getEventBadgeVariant = (type) => {
        if (!type) return 'default';
        if (type.includes('failure') || type.includes('unauthorized') || type.includes('cancelled')) return 'danger';
        if (type.includes('deleted')) return 'warning';
        if (type.includes('alert')) return 'warning';
        if (type.includes('success') || type.includes('created') || type.includes('completed') || type.includes('verified')) return 'success';
        return 'primary';
    };

    return (
        <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
            <AdminPageHeader
                title="Audit Logs"
                description="System security and activity logs"
            />

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <AdminSearch
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    placeholder="Search logs..."
                />
                <AdminFilter
                    value={eventType}
                    onChange={(e) => {
                        setEventType(e.target.value);
                        setPage(1);
                    }}
                    options={eventTypes}
                    icon={Filter}
                />
            </div>

            {/* Audit Logs Table */}
            <AdminCard>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-16 text-gray-500">
                        <div className="w-12 h-12 border-4 border-[#C9A962]/30 border-t-[#C9A962] rounded-full animate-spin mb-4" />
                        <p>Loading audit logs...</p>
                    </div>
                ) : logs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#FAF8F5] text-xs uppercase text-gray-500 font-medium border-b border-[#C9A962]/10">
                                    <th className="px-6 py-4">Event & Status</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Resource</th>
                                    <th className="px-6 py-4">IP Address</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#C9A962]/10">
                                {logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-[#FAF8F5]/50 transition-colors text-sm">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">
                                                        {(log.action || log.eventType || 'unknown').replace(/_/g, ' ')}
                                                    </span>
                                                    {(log.eventType?.includes('failed') || log.eventType?.includes('unauthorized') || log.status === 'failure') && (
                                                        <AlertCircle size={14} className="text-red-500" />
                                                    )}
                                                </div>
                                                <AdminBadge variant={getEventBadgeVariant(log.eventType || log.action)}>
                                                    {log.status || 'unknown'}
                                                </AdminBadge>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{log.email || 'Unknown'}</span>
                                                {log.userId && (
                                                    <span className="text-xs text-gray-400 font-mono" title={log.userId}>
                                                        {log.userId.substring(0, 8)}...
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="capitalize text-gray-700">{log.resource || '-'}</span>
                                                {log.resourceId && (
                                                    <span className="text-xs text-gray-400 font-mono">
                                                        {log.resourceId.toString().substring(0, 8)}...
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-gray-600">{log.ipAddress}</span>
                                                <span className="text-xs text-gray-400 truncate max-w-[150px]" title={log.userAgent}>
                                                    {log.userAgent}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {formatDateTime(log.timestamp || log.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.metadata && Object.keys(log.metadata).length > 0 ? (
                                                <details className="group">
                                                    <summary className="text-xs text-[#C9A962] cursor-pointer hover:text-[#E8D5A3] font-medium focus:outline-none">
                                                        View Metadata
                                                    </summary>
                                                    <div className="absolute right-10 mt-2 w-64 p-3 bg-white border border-[#C9A962]/20 rounded-xl shadow-lg z-10 hidden group-open:block">
                                                        <pre className="text-xs text-gray-600 overflow-auto max-h-48 whitespace-pre-wrap">
                                                            {JSON.stringify(log.metadata, null, 2)}
                                                        </pre>
                                                    </div>
                                                </details>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-16 text-center text-gray-500">
                        No audit logs found matching your filters.
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <Pagination
                        page={page}
                        totalPages={pagination.pages}
                        totalItems={pagination.total}
                        onNext={() => setPage(page + 1)}
                        onPrev={() => setPage(page - 1)}
                    />
                )}
            </AdminCard>
        </div>
    );
};

export default AuditLogs;
