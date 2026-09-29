import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    movieCode: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    note: { type: String, trim: true },
    ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// One rating per user per movie.
ratingSchema.index({ movieCode: 1, ratedBy: 1 }, { unique: true });

export const Rating = mongoose.model('Rating', ratingSchema);
