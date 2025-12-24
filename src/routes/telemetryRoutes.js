import express from 'express';
import { getTelemetry, addTelemetry, getTelemetryStats } from '../controllers/telemetryController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route for device simulation (in real app, use API Key)
router.post('/', addTelemetry);

// Protected routes
router.use(protect);
router.get('/:vehicleId', getTelemetry);
router.get('/:vehicleId/stats', getTelemetryStats);

export default router;
