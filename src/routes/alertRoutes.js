import express from 'express';
import { getAlerts, createAlert, resolveAlert } from '../controllers/alertController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAlerts)
  .post(createAlert);

router.route('/:id/resolve')
  .put(resolveAlert);

export default router;
