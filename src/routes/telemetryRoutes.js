import express from 'express';
import { getTelemetry, addTelemetry } from '../controllers/telemetryController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(addTelemetry);

router.route('/:vehicleId')
  .get(getTelemetry);

export default router;
