import Joi from 'joi';
import mongoose from 'mongoose';
import { Rating } from '../models/Rating.js';

const createSchema = Joi.object({
  movieCode: Joi.string().trim().min(1).max(40).required(),
  rating: Joi.number().min(1).max(5).required(),
  note: Joi.string().allow('').max(1000),
  ratedBy: Joi.string().hex().length(24)
}).required();

// GET /api/ratings
export async function getAllRatings(req, res, next) {
  try {
    const ratings = await Rating.find().sort({ createdAt: -1 }).lean();
    res.json({ ratings });
  } catch (err) { next(err); }
}

// GET /api/ratings/:id
export async function getRating(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    const rating = await Rating.findById(id);
    if (!rating) return res.status(404).json({ message: 'Rating not found' });

    res.json({ rating });
  } catch (err) { next(err); }
}

// POST /api/ratings
export async function createRating(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body ?? {}, { stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const doc = { movieCode: value.movieCode, rating: value.rating };
    if (value.note !== undefined) doc.note = value.note;
    if (value.ratedBy !== undefined) doc.ratedBy = value.ratedBy;

    const rating = await Rating.create(doc);
    res.status(201).json({ rating });
  } catch (err) {
    // Duplicate { movieCode, ratedBy } comes back from MongoDB as E11000.
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'This user has already rated this movie' });
    }
    next(err);
  }
}

// GET /api/ratings/summary?movieCode=MV101
export async function getRatingSummary(req, res, next) {
  try {
    const { movieCode } = req.query;
    if (!movieCode) return res.status(400).json({ message: 'movieCode is required' });

    const [summary] = await Rating.aggregate([
      { $match: { movieCode } },
      {
        $group: {
          _id: '$movieCode',
          averageRating: { $avg: '$rating' },
          ratingCount: { $sum: 1 }
        }
      }
    ]);

    res.json({
      movieCode,
      averageRating: summary ? summary.averageRating : 0,
      ratingCount: summary ? summary.ratingCount : 0
    });
  } catch (err) { next(err); }
}
