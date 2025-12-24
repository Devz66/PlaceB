import prisma from '../utils/prisma.js';

// @desc    Get all alerts for user's vehicles
// @route   GET /api/alerts
// @access  Private
export const getAlerts = async (req, res) => {
  try {
    // Find all vehicles belonging to user
    const vehicles = await prisma.vehicle.findMany({
      where: { userId: req.user.id },
      select: { id: true },
    });

    const vehicleIds = vehicles.map(v => v.id);

    const alerts = await prisma.alert.findMany({
      where: {
        vehicleId: { in: vehicleIds },
      },
      include: {
        vehicle: {
          select: { plate: true, model: true },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a new alert (System/Device)
// @route   POST /api/alerts
// @access  Private
export const createAlert = async (req, res) => {
  try {
    const { vehicleId, type, severity, message, status } = req.body;

    // Verify ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId: req.user.id },
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found or unauthorized' });
    }

    const alert = await prisma.alert.create({
      data: {
        vehicleId,
        type,
        severity,
        message,
        status: status || 'active',
      },
    });

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Resolve an alert
// @route   PUT /api/alerts/:id/resolve
// @access  Private
export const resolveAlert = async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);

    // Verify alert exists and belongs to user's vehicle
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: { vehicle: true },
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    if (alert.vehicle.userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const updatedAlert = await prisma.alert.update({
      where: { id: alertId },
      data: { status: 'resolved' },
    });

    res.json(updatedAlert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
