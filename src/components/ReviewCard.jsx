import React from 'react';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline'; // For empty stars if needed for partial ratings

const ReviewCard = ({ review }) => {
  if (!review) {
    return null; // Or some placeholder if a review object is expected but not provided
  }

  const { userName, rating, comment, date } = review;

  // Helper function to render stars
  const renderStars = (count) => {
    const stars = [];
    const fullStars = Math.floor(count);
    const hasHalfStar = count % 1 !== 0; // Check for half star, though we'll use full/empty for simplicity here

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarSolid key={`star-solid-${i}`} className="h-5 w-5 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        // For simplicity, we'll round half stars up or treat as full/empty.
        // A more complex solution would involve a half-star icon or masking.
        // For now, let's just show full stars based on Math.floor or Math.round.
        // Let's use Math.round for a slightly more generous display:
        if (Math.round(count) > i) {
             stars.push(<StarSolid key={`star-solid-half-${i}`} className="h-5 w-5 text-yellow-400" />);
        } else {
            stars.push(<StarOutline key={`star-outline-${i}`} className="h-5 w-5 text-yellow-400" />);
        }
      } 
      else {
        stars.push(<StarOutline key={`star-outline-${i}`} className="h-5 w-5 text-yellow-400" />);
      }
    }
    return stars;
  };

  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'Date not available';

  return (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center mb-2">
        <div className="flex mr-2">
          {renderStars(rating)}
        </div>
        <p className="text-sm font-semibold text-gray-800">{rating.toFixed(1)} out of 5</p>
      </div>
      <p className="text-sm text-gray-700 mb-3 leading-relaxed">
        {comment || "No comment provided."}
      </p>
      <div className="flex justify-between items-center">
        <p className="text-xs font-medium text-gray-600">
          By: <span className="font-bold">{userName || "Anonymous"}</span>
        </p>
        <p className="text-xs text-gray-500">{formattedDate}</p>
      </div>
    </div>
  );
};

export default ReviewCard;
