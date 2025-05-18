// src/components/AddReviewForm.jsx
import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid'; // For filled stars
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'; // For empty stars in selection
import toast from 'react-hot-toast';

const AddReviewForm = ({ productId, onSubmitReview, existingReview }) => {
  const [rating, setRating] = useState(existingReview ? existingReview.rating : 0);
  const [hoverRating, setHoverRating] = useState(0); // For hover effect on stars
  const [comment, setComment] = useState(existingReview ? existingReview.comment : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (rating === 0) {
      setError("Please select a star rating.");
      toast.error("A star rating is required.");
      return;
    }
    if (!comment.trim()) {
      setError("Please enter your review comment.");
      toast.error("A review comment is required.");
      return;
    }
    if (comment.trim().length < 10) {
        setError("Comment must be at least 10 characters long.");
        toast.error("Comment must be at least 10 characters long.");
        return;
    }


    setIsSubmitting(true);
    try {
      // Pass the review data to the parent component (ProductDetails.jsx)
      await onSubmitReview({
        productId,
        rating,
        comment: comment.trim(),
        // If editing, you might pass existingReview.id here
        reviewId: existingReview ? existingReview.id : null 
      });
      
      // Reset form only if it's not an edit or if edit was successful and parent handles state
      if (!existingReview) {
        setRating(0);
        setComment('');
      }
      // Toast for success will be handled in ProductDetails.jsx after successful save
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error(err.message || "Failed to submit review. Please try again.");
      setError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const starElements = [];
  for (let i = 1; i <= 5; i++) {
    starElements.push(
      <button
        type="button"
        key={i}
        className={`focus:outline-none transition-colors duration-150 ease-in-out ${
          (hoverRating || rating) >= i ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
        }`}
        onClick={() => setRating(i)}
        onMouseEnter={() => setHoverRating(i)}
        onMouseLeave={() => setHoverRating(0)}
        aria-label={`Rate ${i} out of 5 stars`}
      >
        <StarIcon className="h-7 w-7 sm:h-8 sm:w-8" />
      </button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        {existingReview ? "Update Your Review" : "Write a Review"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Rating:</label>
          <div className="flex items-center space-x-1">
            {starElements}
          </div>
          {rating > 0 && <p className="text-xs text-gray-500 mt-1">{rating} out of 5 stars selected.</p>}
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1.5">
            Your Review:
          </label>
          <textarea
            id="comment"
            name="comment"
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
            placeholder="Share your thoughts about the product..."
          ></textarea>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              existingReview ? "Update Review" : "Submit Review"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReviewForm;
