export const toReadingActivityResource = (activity, isOwnerOrAdmin = false) => {
  if (!activity) return null;

  const base = {
    id: activity.id,
    userId: activity.userId,
    bookId: activity.bookId,
    status: activity.status,
    startDate: activity.startDate,
    finishDate: activity.finishDate,
    rating: activity.rating,
    quote: activity.quote,
    publicReview: isOwnerOrAdmin || activity.reviewVisibility !== 'Private' ? activity.publicReview : null,
    reviewTitle: isOwnerOrAdmin || (activity.reviewVisibility !== 'Private' && activity.publicReview) ? activity.reviewTitle : null,
    moodTag: activity.moodTag,
    isSpoiler: activity.isSpoiler,
    moderationStatus: activity.moderationStatus,
    book: activity.book,
    user: activity.user
      ? {
          id: activity.user.id,
          username: activity.user.username,
          profile: activity.user.profile,
        }
      : null,
    createdAt: activity.createdAt,
  };

  // Only expose privateNote to the owner or admin!
  if (isOwnerOrAdmin) {
    base.currentPage = activity.currentPage;
    base.privateNote = activity.privateNote;
    base.isFlagged = activity.isFlagged;
    base.flagReason = activity.flagReason;
  }

  return base;
};
