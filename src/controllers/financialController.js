import prisma from '../utils/prisma.js';

// @desc    Get all financial records for the user
// @route   GET /api/financial
// @access  Private
export const getFinancials = async (req, res) => {
  try {
    const financials = await prisma.financial.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(financials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a new financial record (Admin or System)
// @route   POST /api/financial
// @access  Private (Admin)
export const createFinancial = async (req, res) => {
  try {
    const { type, description, amount, dueDate, status, barcode, url } = req.body;
    
    const financial = await prisma.financial.create({
      data: {
        type,
        description,
        amount,
        dueDate: dueDate ? new Date(dueDate) : null,
        status,
        barcode,
        url,
        userId: req.user.id // In a real app, this might be assigned to a specific user by an admin
      }
    });

    res.status(201).json(financial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
