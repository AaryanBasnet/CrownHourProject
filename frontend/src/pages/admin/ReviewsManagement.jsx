import { useState } from 'react';
import { useReviews, useUpdateReviewStatus, useDeleteReview } from '../../hooks/useAdmin';
import { Filter, Check, X, Trash2, Star, MessageSquare } from 'lucide-react';
import {
    AdminPageHeader,
    AdminCard,
    AdminFilter,
    AdminBadge,
    AdminButton,
    Pagination
} from '../../components/admin/common/AdminComponents';
import { Link } from 'react-router-dom';

/**
 * Reviews Management Page
 * Admin page for moderating product reviews
 * Luxury Light Theme Implementation
 */

const ReviewsManagement = () => {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('');
    const limit = 10;

    const { data, isLoading, error } = useReviews({ page, limit, status });
    const updateStatusMutation = useUpdateReviewStatus();
    const deleteReviewMutation = useDeleteReview();

    const handleApprove = async (reviewId, isApproved) => {
        try {
            await updateStatusMutation.mutateAsync({ reviewId, isApproved });
        } catch (error) {
            alert('Failed to update review status');
        }
    };

    const handleDelete = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await deleteReviewMutation.mutateAsync(reviewId);
            } catch (error) {
                alert('Failed to delete review');
            }
        }
    };

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                <h2 className="text-2xl font-bold mb-2">Error Loading Reviews</h2>
                <p>{error.message}</p>
            </div>
        );
    }

    const reviews = data?.reviews || [];
    const pagination = data?.pagination || {};

    const statusOptions = [
        { value: '', label: 'All Reviews' },
        { value: 'pending', label: 'Pending Approval' },
        { value: 'approved', label: 'Approved' },
    ];

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={16}
                className={i < rating ? 'text-[#C9A962] fill-[#C9A962]' : 'text-gray-300'}
            />
        ));
    };

    return (
        <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
            <AdminPageHeader
                title="Reviews Management"
                description="Moderate and manage product reviews"
            />

            {/* Filters */}
            <div className="flex mb-8">
                <AdminFilter
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                    options={statusOptions}
                    icon={Filter}
                />
            </div>

            {/* Reviews List */}
            <AdminCard>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-16 text-gray-500">
                        <div className="w-12 h-12 border-4 border-[#C9A962]/30 border-t-[#C9A962] rounded-full animate-spin mb-4" />
                        <p>Loading reviews...</p>
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="divide-y divide-[#C9A962]/10">
                        {reviews.map((review) => (
                            <div key={review._id} className="p-6 hover:bg-[#FAF8F5]/50 transition-colors">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Content Section */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-[#C9A962]/20 text-[#C9A962] flex items-center justify-center font-bold text-sm">
                                                    {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {review.user?.firstName} {review.user?.lastName}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{review.user?.email}</p>
                                                </div>
                                            </div>
                                            <AdminBadge variant={review.isApproved ? 'success' : 'warning'}>
                                                {review.isApproved ? 'Approved' : 'Pending'}
                                            </AdminBadge>
                                        </div>

                                        <div className="mb-4 pl-14">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex">{renderStars(review.rating)}</div>
                                                <span className="text-gray-300">•</span>
                                                <Link
                                                    to={`/product/${review.product?._id}`}
                                                    target="_blank"
                                                    className="text-sm text-gray-600 hover:text-[#C9A962] font-medium transition-colors"
                                                >
                                                    {review.product?.brand} {review.product?.name}
                                                </Link>
                                            </div>
                                            {review.title && <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>}
                                            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                {review.comment}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pl-14">
                                            <span className="text-sm text-gray-400">
                                                Posted on {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Section */}
                                    <div className="flex md:flex-col gap-2 md:border-l border-gray-100 md:pl-6 md:min-w-[140px] justify-end">
                                        {!review.isApproved && (
                                            <AdminButton
                                                variant="primary"
                                                onClick={() => handleApprove(review._id, true)}
                                                disabled={updateStatusMutation.isLoading}
                                                className="w-full text-sm py-2 px-3"
                                            >
                                                <Check size={16} />
                                                Approve
                                            </AdminButton>
                                        )}
                                        {review.isApproved && (
                                            <AdminButton
                                                variant="secondary"
                                                onClick={() => handleApprove(review._id, false)}
                                                disabled={updateStatusMutation.isLoading}
                                                className="w-full text-sm py-2 px-3"
                                            >
                                                <X size={16} />
                                                Reject
                                            </AdminButton>
                                        )}
                                        <AdminButton
                                            variant="danger"
                                            onClick={() => handleDelete(review._id)}
                                            disabled={deleteReviewMutation.isLoading}
                                            className="w-full text-sm py-2 px-3"
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </AdminButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-16 text-center text-gray-500">
                        <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No reviews found matching your filters.</p>
                    </div>
                )}

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

export default ReviewsManagement;
