import prisma from '../utils/prisma.js';

// Helper to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// @desc    Register a new vehicle
// @route   POST /api/vehicles
// @access  Private
export const createVehicle = async (req, res) => {
  try {
    const { plate, model, driver } = req.body;

    const vehicle = await prisma.vehicle.create({
      data: {
        plate,
        model,
        driver,
        userId: req.user.id,
      },
    });

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all vehicles for logged in user
// @route   GET /api/vehicles
// @access  Private
export const getVehicles = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId: req.user.id },
      include: {
        locations: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
        telemetry: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        locations: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
        telemetry: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (vehicle.userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update location (Tracking)
// @route   POST /api/vehicles/:id/location
// @access  Private (or dedicated API key for device)
export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, speed } = req.body;
    const vehicleId = parseInt(req.params.id);

    // Verify vehicle exists (and ownership if needed, though tracking devices might use different auth)
    // For now assuming user auth for simplicity or device sends token
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const location = await prisma.location.create({
      data: {
        latitude,
        longitude,
        speed,
        vehicleId,
      },
    });

    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get route history
// @route   GET /api/vehicles/:id/history
// @access  Private
export const getRouteHistory = async (req, res) => {
  try {
    const { start, end } = req.query; // timestamps
    const vehicleId = parseInt(req.params.id);

    const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
    });
  
    if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
    }
  
    if (vehicle.userId !== req.user.id) {
        return res.status(401).json({ error: 'Not authorized' });
    }

    const where = {
      vehicleId,
    };

    if (start && end) {
      where.timestamp = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    const locations = await prisma.location.findMany({
      where,
      orderBy: { timestamp: 'asc' },
    });

    let totalDistance = 0;
    for (let i = 0; i < locations.length - 1; i++) {
      totalDistance += calculateDistance(
        locations[i].latitude,
        locations[i].longitude,
        locations[i+1].latitude,
        locations[i+1].longitude
      );
    }

    res.json({
      locations,
      totalDistance: parseFloat(totalDistance.toFixed(2)), // km
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
