import express from 'express';
import { getGeofences, createGeofence, updateGeofence, deleteGeofence } from '../controllers/geofenceController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getGeofences)
  .post(createGeofence);

router.route('/:id')
  .put(updateGeofence)
  .delete(deleteGeofence);

export default router;
