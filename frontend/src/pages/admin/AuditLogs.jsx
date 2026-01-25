import { useState } from 'react';
import { useAuditLogs } from '../../hooks/useAdmin';
import { Filter, AlertCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import {
    AdminPageHeader,
    AdminCard,
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
    const limit = 20;

    const { data, isLoading, error } = useAuditLogs({ page, limit, eventType });

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
            <div className="flex mb-8">
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

            {/* Audit Logs List */}
            <AdminCard>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-16 text-gray-500">
                        <div className="w-12 h-12 border-4 border-[#C9A962]/30 border-t-[#C9A962] rounded-full animate-spin mb-4" />
                        <p>Loading audit logs...</p>
                    </div>
                ) : logs.length > 0 ? (
                    <div className="divide-y divide-[#C9A962]/10">
                        {logs.map((log) => (
                            <div key={log._id} className="p-6 hover:bg-[#FAF8F5]/50 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <AdminBadge variant={getEventBadgeVariant(log.eventType)}>
                                            {(log.eventType || 'unknown').replace(/_/g, ' ')}
                                        </AdminBadge>
                                        <span className="text-sm text-gray-500 font-medium">
                                            {formatDateTime(log.timestamp)}
                                        </span>
                                    </div>

                                    {(log.eventType?.includes('failed') || log.eventType?.includes('unauthorized')) && (
                                        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
                                            <AlertCircle size={16} />
                                            <span>Security Event</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                                    {log.userId && (
                                        <div className="flex flex-col">
                                            <span className="text-gray-500">User ID</span>
                                            <span className="font-mono text-gray-700">{log.userId}</span>
                                        </div>
                                    )}
                                    {log.email && (
                                        <div className="flex flex-col">
                                            <span className="text-gray-500">Email</span>
                                            <span className="font-medium text-gray-900">{log.email}</span>
                                        </div>
                                    )}
                                    {log.ipAddress && (
                                        <div className="flex flex-col">
                                            <span className="text-gray-500">IP Address</span>
                                            <span className="font-mono text-gray-700">{log.ipAddress}</span>
                                        </div>
                                    )}
                                    {log.userAgent && (
                                        <div className="flex flex-col">
                                            <span className="text-gray-500">User Agent</span>
                                            <span className="text-gray-700 truncate" title={log.userAgent}>{log.userAgent}</span>
                                        </div>
                                    )}
                                </div>

                                {log.metadata && Object.keys(log.metadata).length > 0 && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Additional Details</p>
                                        <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap overflow-x-auto">
                                            {JSON.stringify(log.metadata, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        ))}
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
