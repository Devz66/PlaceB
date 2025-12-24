import prisma from '../utils/prisma.js';

// @desc    Get all geofences for user
// @route   GET /api/geofences
// @access  Private
export const getGeofences = async (req, res) => {
  try {
    const geofences = await prisma.geofence.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(geofences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a new geofence
// @route   POST /api/geofences
// @access  Private
export const createGeofence = async (req, res) => {
  try {
    const { name, type, coordinates, color, active } = req.body;

    const geofence = await prisma.geofence.create({
      data: {
        name,
        type,
        coordinates,
        color,
        active: active !== undefined ? active : true,
        userId: req.user.id,
      },
    });

    res.status(201).json(geofence);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update a geofence
// @route   PUT /api/geofences/:id
// @access  Private
export const updateGeofence = async (req, res) => {
  try {
    const geofenceId = parseInt(req.params.id);
    const { name, type, coordinates, color, active } = req.body;

    const geofence = await prisma.geofence.findUnique({
      where: { id: geofenceId },
    });

    if (!geofence) {
      return res.status(404).json({ error: 'Geofence not found' });
    }

    if (geofence.userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const updatedGeofence = await prisma.geofence.update({
      where: { id: geofenceId },
      data: {
        name,
        type,
        coordinates,
        color,
        active,
      },
    });

    res.json(updatedGeofence);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a geofence
// @route   DELETE /api/geofences/:id
// @access  Private
export const deleteGeofence = async (req, res) => {
  try {
    const geofenceId = parseInt(req.params.id);

    const geofence = await prisma.geofence.findUnique({
      where: { id: geofenceId },
    });

    if (!geofence) {
      return res.status(404).json({ error: 'Geofence not found' });
    }

    if (geofence.userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    await prisma.geofence.delete({
      where: { id: geofenceId },
    });

    res.json({ message: 'Geofence removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
