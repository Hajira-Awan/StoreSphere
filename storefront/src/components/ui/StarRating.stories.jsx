import { StarRating } from './StarRating';

export default {
  title: 'UI/StarRating',
  component: StarRating,
};

export const HighRating = { args: { rating: 4.7, reviewCount: 128 } };
export const MidRating = { args: { rating: 3.5, reviewCount: 12 } };
export const LowRating = { args: { rating: 1.8, reviewCount: 3 } };
export const NoReviews = { args: { rating: 5, reviewCount: 0 } };
