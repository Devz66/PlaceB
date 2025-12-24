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

// @desc    Get aggregated telemetry stats for dashboard
// @route   GET /api/telemetry/:vehicleId/stats
// @access  Private
export const getTelemetryStats = async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId);
    
    // Verify ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId: req.user.id },
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found or unauthorized' });
    }

    // Get last 20 records for charts
    const telemetry = await prisma.telemetry.findMany({
      where: { vehicleId },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    if (telemetry.length === 0) {
      return res.json({
        current: {},
        history: { speed: [], rpm: [] }
      });
    }

    // Calculate trends (simple comparison of last vs average of last 5)
    const current = telemetry[0];
    const last5 = telemetry.slice(0, 5);
    const avgSpeed = last5.reduce((acc, curr) => acc + (curr.speed || 0), 0) / last5.length;
    const speedTrend = current.speed && avgSpeed ? ((current.speed - avgSpeed) / avgSpeed) * 100 : 0;

    const stats = {
      current: {
        speed: current.speed,
        rpm: current.rpm,
        temp: current.temp,
        battery: current.battery,
        fuel: current.fuelLevel,
        ignition: current.ignition
      },
      trends: {
        speed: Math.round(speedTrend)
      },
      history: {
        speed: telemetry.map(t => t.speed || 0).reverse(),
        rpm: telemetry.map(t => t.rpm || 0).reverse(),
        timestamps: telemetry.map(t => t.timestamp).reverse()
      }
    };

    res.json(stats);

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

    res.status(201).json(telemetry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
