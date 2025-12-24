import prisma from '../utils/prisma.js';

// @desc    Get telemetry history for a vehicle
// @route   GET /api/telemetry/:vehicleId
// @access  Private
export const getTelemetry = async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId);
    const limit = parseInt(req.query.limit) || 100;

    // Verify ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId: req.user.id },
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found or unauthorized' });
    }

    const telemetry = await prisma.telemetry.findMany({
      where: { vehicleId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    res.json(telemetry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add telemetry data (Device API)
// @route   POST /api/telemetry
// @access  Private (or Device API Key)
export const addTelemetry = async (req, res) => {
  try {
    const { vehicleId, speed, fuelLevel, battery, ignition, rpm, temp } = req.body;

    // Verify vehicle exists
    // In real app, check device token. Here assume req.user or just check existence if unsecured for demo.
    // Assuming authenticated user for now for simplicity
    const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId }
    });

    if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
    }

    const telemetry = await prisma.telemetry.create({
      data: {
        vehicleId,
        speed,
        fuelLevel,
        battery,
        ignition,
        rpm,
        temp
      },
    });

    // Also update vehicle location if lat/lng provided? 
    // Usually telemetry comes with location. For now keeping separate as per schema.

    res.status(201).json(telemetry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
