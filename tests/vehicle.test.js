import request from 'supertest';
import { jest } from '@jest/globals';

// Mock Prisma
const mockPrisma = {
  vehicle: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  location: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

// Mock Auth Middleware
const mockAuthMiddleware = {
  protect: (req, res, next) => {
    req.user = { id: 1, name: 'Test User', email: 'test@example.com' };
    next();
  },
};

// Use unstable_mockModule
jest.unstable_mockModule('../src/utils/prisma.js', () => ({
  default: mockPrisma,
}));

jest.unstable_mockModule('../src/middlewares/authMiddleware.js', () => mockAuthMiddleware);

// Import app after mocking
const { default: app } = await import('../src/app.js');

describe('Vehicle Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new vehicle', async () => {
    mockPrisma.vehicle.create.mockResolvedValue({
      id: 1,
      plate: 'ABC-1234',
      model: 'Truck',
      userId: 1,
    });

    const res = await request(app)
      .post('/api/vehicles')
      .send({
        plate: 'ABC-1234',
        model: 'Truck',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('plate', 'ABC-1234');
  });

  it('should update vehicle location', async () => {
    mockPrisma.vehicle.findUnique.mockResolvedValue({
        id: 1,
        plate: 'ABC-1234',
        userId: 1
    });

    mockPrisma.location.create.mockResolvedValue({
      id: 1,
      latitude: -23.55,
      longitude: -46.63,
      speed: 60,
      vehicleId: 1,
    });

    const res = await request(app)
      .post('/api/vehicles/1/location')
      .send({
        latitude: -23.55,
        longitude: -46.63,
        speed: 60,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('latitude', -23.55);
  });
});
