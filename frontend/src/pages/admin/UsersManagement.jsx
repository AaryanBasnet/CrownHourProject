import { useState } from 'react';
import { useUsers, useUpdateUserStatus, useDeleteUser } from '../../hooks/useAdmin';
import { Search, Filter, UserCheck, UserX, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Users Management Page
 * Admin page for managing user accounts
 * 
 * Features:
 * - User listing with pagination
 * - Search and filter
 * - Activate/deactivate users
 * - Delete users
 * - View user details
 */

const UsersManagement = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const limit = 10;

    const { data, isLoading, error } = useUsers({ page, limit, search, status });
    const updateStatusMutation = useUpdateUserStatus();
    const deleteUserMutation = useDeleteUser();

    const handleStatusChange = async (userId, currentStatus) => {
        try {
            await updateStatusMutation.mutateAsync({
                userId,
                isActive: !currentStatus,
            });
        } catch (error) {
            alert('Failed to update user status');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUserMutation.mutateAsync(userId);
            } catch (error) {
                alert('Failed to delete user');
            }
        }
    };

    if (error) {
        return (
            <div className="admin-page">
                <div className="admin-error">
                    <h2>Error Loading Users</h2>
                    <p>{error.message}</p>
                </div>
            </div>
        );
    }

    const users = data?.users || [];
    const pagination = data?.pagination || {};

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1>Users Management</h1>
                    <p>Manage user accounts and permissions</p>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-filters">
                <div className="admin-search">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <div className="admin-filter-group">
                    <Filter size={20} />
                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="admin-card">
                <div className="admin-table-container">
                    {isLoading ? (
                        <div className="admin-loading">
                            <div className="spinner"></div>
                            <p>Loading users...</p>
                        </div>
                    ) : users.length > 0 ? (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <div className="admin-user-cell">
                                                <div className="admin-user-avatar">
                                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                                </div>
                                                <span className="font-medium">
                                                    {user.firstName} {user.lastName}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`admin-badge ${user.role?.name}`}>
                                                {user.role?.name || 'customer'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`admin-badge ${user.isActive ? 'success' : 'danger'}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="admin-actions">
                                                <Link
                                                    to={`/admin/users/${user._id}`}
                                                    className="admin-action-btn view"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleStatusChange(user._id, user.isActive)}
                                                    className={`admin-action-btn ${user.isActive ? 'warning' : 'success'}`}
                                                    title={user.isActive ? 'Deactivate' : 'Activate'}
                                                    disabled={updateStatusMutation.isLoading}
                                                >
                                                    {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="admin-action-btn danger"
                                                    title="Delete User"
                                                    disabled={deleteUserMutation.isLoading}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="admin-empty-state">No users found</p>
                    )}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="admin-pagination">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="admin-pagination-btn"
                        >
                            Previous
                        </button>
                        <span className="admin-pagination-info">
                            Page {page} of {pagination.pages} ({pagination.total} total)
                        </span>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === pagination.pages}
                            className="admin-pagination-btn"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersManagement;
