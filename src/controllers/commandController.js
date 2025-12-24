import prisma from '../utils/prisma.js';

// @desc    Get command history for a vehicle
// @route   GET /api/commands/:vehicleId
// @access  Private
export const getCommands = async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId);

    // Verify ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId: req.user.id },
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found or unauthorized' });
    }

    const commands = await prisma.command.findMany({
      where: { vehicleId },
      orderBy: { sentAt: 'desc' },
    });

    res.json(commands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Send a command to a vehicle
// @route   POST /api/commands
// @access  Private
export const sendCommand = async (req, res) => {
  try {
    const { vehicleId, command } = req.body;

    // Verify ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId: req.user.id },
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found or unauthorized' });
    }

    // Create command record
    const newCommand = await prisma.command.create({
      data: {
        vehicleId,
        command,
        status: 'PENDING',
        userId: req.user.id,
      },
    });

    // In a real system, here we would send the command to the device via MQTT/TCP/SMS
    // For now, we simulate execution
    setTimeout(async () => {
        try {
            await prisma.command.update({
                where: { id: newCommand.id },
                data: { status: 'EXECUTED', executedAt: new Date() }
            });
        } catch (e) {
            console.error('Failed to update command status', e);
        }
    }, 2000);

    res.status(201).json(newCommand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
