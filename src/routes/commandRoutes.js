import express from 'express';
import { getCommands, sendCommand } from '../controllers/commandController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(sendCommand);

router.route('/:vehicleId')
  .get(getCommands);

export default router;
