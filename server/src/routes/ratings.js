import { Router } from 'express';
import {
  getAllRatings,
  getRating,
  createRating,
  getRatingSummary
} from '../controllers/ratingController.js';

const router = Router();

router.get('/', getAllRatings);
// /summary is registered before /:id so it is never treated as an id.
router.get('/summary', getRatingSummary);
router.get('/:id', getRating);
router.post('/', createRating);

export default router;
