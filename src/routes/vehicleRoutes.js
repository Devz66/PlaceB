import express from 'express';
import { z } from 'zod';
import {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateLocation,
  getRouteHistory,
} from '../controllers/vehicleController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';

const router = express.Router();

// Validation Schemas
const createVehicleSchema = z.object({
  plate: z.string().min(1),
  model: z.string().optional(),
});

const updateLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  speed: z.number().optional(),
});

// Swagger Documentation

/**
 * @swagger
 * components:
 *   schemas:
 *     Vehicle:
 *       type: object
 *       required:
 *         - plate
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the vehicle
 *         plate:
 *           type: string
 *           description: The vehicle license plate
 *         model:
 *           type: string
 *           description: The vehicle model
 *         userId:
 *           type: integer
 *           description: The id of the owner
 *     Location:
 *       type: object
 *       properties:
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 *         speed:
 *           type: number
 *         timestamp:
 *           type: string
 *           format: date-time
 */

router.use(protect); // All routes protected

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: Get all vehicles for the logged in user
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicle'
 *   post:
 *     summary: Register a new vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plate
 *             properties:
 *               plate:
 *                 type: string
 *               model:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vehicle created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicle'
 */
router.route('/')
  .post(validate(createVehicleSchema), createVehicle)
  .get(getVehicles);

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     summary: Get vehicle by ID
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicle'
 *       404:
 *         description: Vehicle not found
 */
router.route('/:id')
  .get(getVehicleById);

/**
 * @swagger
 * /vehicles/{id}/location:
 *   post:
 *     summary: Update vehicle location
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Vehicle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               speed:
 *                 type: number
 *     responses:
 *       201:
 *         description: Location updated
 */
router.post('/:id/location', validate(updateLocationSchema), updateLocation);

/**
 * @swagger
 * /vehicles/{id}/history:
 *   get:
 *     summary: Get vehicle route history
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Vehicle ID
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start timestamp
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End timestamp
 *     responses:
 *       200:
 *         description: History of locations and total distance
 */
router.get('/:id/history', getRouteHistory);

export default router;
