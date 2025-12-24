import express from 'express';
import { getFinancials, createFinancial } from '../controllers/financialController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getFinancials);
router.post('/', createFinancial);

export default router;
