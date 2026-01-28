import { useState } from 'react';
import PropTypes from 'prop-types';
import { Star, ThumbsUp, Loader2 } from 'lucide-react';
import { reviewService } from '@services';
import { useToast } from '../../context/ToastContext';
import { sanitizeUserContent, sanitizeObject, containsMaliciousContent } from '@utils/sanitize';

/**
 * ReviewSection Component
 * Displays reviews with rating distribution and submission form
 * 
 * Security:
 * - DOMPurify for user-generated content
 * - XSS protection
 * - Authenticated submission only
 */
export const ReviewSection = ({
    productId,
    reviews,
    pagination,
    ratingDistribution,
    averageRating,
    totalReviews,
    isLoading,
    isLoggedIn,
    onPageChange,
    onReviewSubmitted,
}) => {
    const { addToast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        rating: 5,
        title: '',
        comment: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.comment.trim()) {
            addToast('Please fill in all fields', 'error');
            return;
        }

        // Security check: Detect if user is attempting to enter scripts
        if (containsMaliciousContent(formData.title) || containsMaliciousContent(formData.comment)) {
            addToast('Security Warning: Potentially unsafe content detected and removed.', 'warning');
        }

        setIsSubmitting(true);
        try {
            const cleanData = sanitizeObject(formData);
            await reviewService.createReview({
                productId,
                ...cleanData,
            });
            addToast('Review submitted successfully!', 'success');
            setShowForm(false);
            setFormData({ rating: 5, title: '', comment: '' });
            onReviewSubmitted();
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to submit review', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVoteHelpful = async (reviewId) => {
        if (!isLoggedIn) {
            addToast('Please login to vote', 'error');
            return;
        }
        try {
            await reviewService.voteHelpful(reviewId);
            onReviewSubmitted(); // Refresh reviews
        } catch (err) {
            addToast('Failed to vote', 'error');
        }
    };

    const renderStars = (rating, interactive = false, onChange = null) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type={interactive ? 'button' : undefined}
                        onClick={interactive ? () => onChange(star) : undefined}
                        disabled={!interactive}
                        className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
                    >
                        <Star
                            size={interactive ? 24 : 16}
                            className={star <= rating ? 'fill-[#C9A962] text-[#C9A962]' : 'text-gray-300'}
                        />
                    </button>
                ))}
            </div>
        );
    };

    const getRatingPercentage = (rating) => {
        if (totalReviews === 0) return 0;
        return Math.round((ratingDistribution[rating] / totalReviews) * 100);
    };

    return (
        <section className="max-w-[1400px] mx-auto px-4 py-16">
            <h2 className="font-display text-3xl lg:text-4xl text-center text-[#1A1A1A] mb-12">
                Customer Reviews
            </h2>

            {/* Rating Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                {/* Average Rating */}
                <div className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                        <span className="font-display text-6xl text-[#1A1A1A]">
                            {averageRating.toFixed(1)}
                        </span>
                        <div>
                            {renderStars(Math.round(averageRating))}
                            <p className="text-[#6B6B6B] text-sm mt-1">
                                Based on {totalReviews} reviews
                            </p>
                        </div>
                    </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-3">
                            <span className="text-sm text-[#6B6B6B] w-6">{rating}★</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                                <div
                                    className="h-full bg-[#C9A962] transition-all duration-500"
                                    style={{ width: `${getRatingPercentage(rating)}%` }}
                                />
                            </div>
                            <span className="text-sm text-[#6B6B6B] w-10">
                                {ratingDistribution[rating] || 0}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Write Review Button */}
            <div className="text-center mb-8">
                {isLoggedIn ? (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-8 py-3 border border-[#1A1A1A] text-[#1A1A1A] text-sm uppercase tracking-[0.15em] hover:bg-[#1A1A1A] hover:text-white transition-colors"
                    >
                        {showForm ? 'Cancel' : 'Write a Review'}
                    </button>
                ) : (
                    <p className="text-[#6B6B6B]">
                        Please <a href="/login" className="text-[#C9A962] hover:underline">login</a> to write a review
                    </p>
                )}
            </div>

            {/* Review Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12 p-6 bg-white border border-black/5">
                    {/* Rating */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                            Your Rating
                        </label>
                        {renderStars(formData.rating, true, (rating) => setFormData(prev => ({ ...prev, rating })))}
                    </div>

                    {/* Title */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                            Review Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            maxLength={100}
                            placeholder="Summarize your experience"
                            className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-[#C9A962]"
                        />
                    </div>

                    {/* Comment */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                            Your Review
                        </label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                            maxLength={1000}
                            rows={4}
                            placeholder="Share your thoughts about this product..."
                            className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-[#C9A962] resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-[#1A1A1A] text-white text-sm uppercase tracking-[0.15em] hover:bg-[#C9A962] transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                            'Submit Review'
                        )}
                    </button>
                </form>
            )}

            {/* Reviews List */}
            {isLoading ? (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-[#C9A962] animate-spin mx-auto" />
                </div>
            ) : reviews.length > 0 ? (
                <div className="space-y-8">
                    {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-100 pb-8">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {renderStars(review.rating)}
                                        {review.isVerifiedPurchase && (
                                            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5">
                                                Verified Purchase
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-medium text-[#1A1A1A]">{review.title}</h4>
                                </div>
                                <span className="text-sm text-[#6B6B6B]">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div
                                className="text-[#6B6B6B] mb-4 text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: sanitizeUserContent(review.comment) }}
                            />

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[#6B6B6B]">
                                    By {review.user?.firstName} {review.user?.lastName?.charAt(0)}.
                                </span>
                                <button
                                    onClick={() => handleVoteHelpful(review._id)}
                                    className="flex items-center gap-2 text-sm text-[#6B6B6B] hover:text-[#C9A962] transition-colors"
                                >
                                    <ThumbsUp size={14} />
                                    Helpful ({review.helpfulVotes || 0})
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex justify-center gap-2 pt-8">
                            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`w-10 h-10 border ${pagination.page === page
                                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                                        : 'border-black/10 text-[#1A1A1A] hover:border-[#C9A962]'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-center text-[#6B6B6B] py-12">
                    No reviews yet. Be the first to review this product!
                </p>
            )}
        </section>
    );
};

ReviewSection.propTypes = {
    productId: PropTypes.string.isRequired,
    reviews: PropTypes.array.isRequired,
    pagination: PropTypes.object.isRequired,
    ratingDistribution: PropTypes.object.isRequired,
    averageRating: PropTypes.number.isRequired,
    totalReviews: PropTypes.number.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onReviewSubmitted: PropTypes.func.isRequired,
};
