import 'reflect-metadata';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { LayawayStatus } from '../db/schemas/layaway.schema';

// Constants for testing
const { SECRET_KEY } = process.env;

// Define mock IDs
const MOCK_IDS = {
  layaway: '61a9f7b8d4f9a12345678901',
  payment: '61a9f7b8d4f9a12345678902',
  client: '61a9f7b8d4f9a12345678903',
  user: '61a9f7b8d4f9a12345678904',
  item: '61a9f7b8d4f9a12345678905',
  nonExistent: '61a9f7b8d4f9a12345678999'
};

// Mock the layaway service module
const mockLayawayService = {
  create: jest.fn(),
  findAllWithFilters: jest.fn(),
  findOne: jest.fn(),
  addPayment: jest.fn(),
  markAsDelivered: jest.fn(),
  cancel: jest.fn()
};

// Mock the layaway payment service
const mockLayawayPaymentService = {
  findByLayawayId: jest.fn()
};

const mockModuleService = {
  findByCode: jest.fn()
}

// Mock the tsyringe container
jest.mock('tsyringe', () => ({
  singleton: () => (target: any) => target,
  autoInjectable: () => (target: any) => target,
  injectable: () => (target: any) => target,
  container: {
    resolve: jest.fn((token) => {
      if (token === 'LayawayService' || (typeof token === 'function' && token.name === 'LayawayService')) {
        return mockLayawayService;
      }
      if (token === 'LayawayPaymentService' || (typeof token === 'function' && token.name === 'LayawayPaymentService')) {
        return mockLayawayPaymentService;
      }
      if (token === 'ModuleService' || (typeof token === 'function' && token.name === 'ModuleService')) {
        return mockModuleService;
      }
      return {};
    }),
    registerSingleton: jest.fn()
  }
}));

// Import routes after mocking
import layawayRouter from '../routes/index';



// Configure Express app for testing
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use('/layaways', layawayRouter);

// Helper function to generate a test JWT token
const generateTestToken = () => {
  const payload = {
    data: {
      id: MOCK_IDS.user,
      name: 'Test User',
      roles: ['ADMIN', 'SELLER'],
      organization: {},
    },
    type: 'access'
  };
  const secret = SECRET_KEY as string;
  return jwt.sign(payload, secret, { expiresIn: '1h' });
};

describe('Layaway API Integration Tests', () => {
  let token: string;
  
  // Create mock data
  const mockLayaway = {
    _id: MOCK_IDS.layaway,
    code: 'LAY-001',
    totalAmount: 1000,
    initialPayment: 200,
    remainingAmount: 800,
    paidAmount: 200,
    agreementDate: new Date(),
    expectedDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in the future
    clientId: MOCK_IDS.client,
    status: LayawayStatus.ACTIVE,
    items: [
      {
        _id: MOCK_IDS.item,
        code: 'ITEM-001',
        name: 'Test Item',
        description: 'Test Description',
        price: 1000,
        units: 1,
        measurementUnit: 'unit',
        multiplicity: 1,
        lot: null,
        expirationDate: null,
        laboratory: null
      }
    ],
    payments: [MOCK_IDS.payment],
    notes: 'Test notes',
    createdBy: {
      id: MOCK_IDS.user,
      name: 'Test User'
    },
    client: {
      id: MOCK_IDS.client,
      name: 'Test Client'
    },
    createdAt: {
      date: Date.now(),
      offset: -300
    },
    updatedAt: null
  };

  const mockPayment = {
    _id: MOCK_IDS.payment,
    amount: 200,
    paymentMethod: 'CASH',
    receiptNumber: 'REC-001',
    notes: 'Initial payment',
    createdBy: {
      id: MOCK_IDS.user,
      name: 'Test User'
    },
    layawayId: MOCK_IDS.layaway,
    createdAt: {
      date: Date.now(),
      offset: -300
    }
  };

  beforeAll(() => {
    // Generate test token
    token = generateTestToken();

    // Setup mock implementations
    mockLayawayService.findAllWithFilters.mockResolvedValue({
      layaways: [mockLayaway],
      pagination: {
        totalDocs: 1,
        totalPages: 1,
        currentPage: 1,
        limit: 10
      }
    });

    mockLayawayService.findOne.mockImplementation((id) => {
      if (id === MOCK_IDS.layaway) {
        return Promise.resolve(mockLayaway);
      } else if (id === MOCK_IDS.nonExistent) {
        return Promise.resolve(null);
      }
      return Promise.resolve(mockLayaway);
    });

    mockLayawayService.create.mockResolvedValue(mockLayaway);
    
    mockLayawayService.addPayment.mockResolvedValue({
      ...mockLayaway,
      paidAmount: 400,
      remainingAmount: 600,
      payments: [MOCK_IDS.payment, 'another-payment-id']
    });
    
    mockLayawayService.markAsDelivered.mockResolvedValue({
      ...mockLayaway,
      status: LayawayStatus.DELIVERED
    });
    
    mockLayawayService.cancel.mockResolvedValue({
      ...mockLayaway,
      status: LayawayStatus.CANCELED
    });
    
    mockLayawayPaymentService.findByLayawayId.mockResolvedValue([mockPayment]);
    
    mockModuleService.findByCode.mockResolvedValue({
      "_id": "63c5d63fefc6faadaa4a203f",
      "name": "Facturación",
      "uri": "/billing",
      "icon": "billing",
      "createdAt": "15/01/2023",
      "updatedAt": "15/01/2023",
      "code": "BILLING",
      "access": [
        {
          "roleCode": "ADMIN",
          "canAccess": true,
          "canCreate": true,
          "canUpdate": true,
          "canDelete": true,
          "canExecute": true
        },
        {
          "roleCode": "SELLER",
          "canAccess": true,
          "canCreate": true,
          "canUpdate": false,
          "canDelete": false,
          "canExecute": false
        }
      ]
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /layaways', () => {
    it('should return all layaways with pagination', async () => {
      const response = await request(app)
        .get('/layaways')
        .set('Cookie', [`access_token=${token}`]);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('layaways');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.layaways.length).toBe(1);
      expect(response.body.layaways[0]).toHaveProperty('code', 'LAY-001');
    });

    it('should apply filters when provided', async () => {
      const response = await request(app)
        .get('/layaways?status=ACTIVE')
        .set('Cookie', [`access_token=${token}`]);
      
      expect(response.status).toBe(200);
    });
  });

  describe('GET /layaways/:id', () => {
    it('should return a single layaway by ID', async () => {
      
      const response = await request(app)
        .get(`/layaways/${MOCK_IDS.layaway}`)
        .set('Cookie', [`access_token=${token}`]);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('code', 'LAY-001');
      expect(response.body).toHaveProperty('status', LayawayStatus.ACTIVE);
    });

    it('should handle nonexistent layaway ID gracefully', async () => {
      // Override mock just for this test
      mockLayawayService.findOne.mockResolvedValueOnce(null);
      
      const response = await request(app)
        .get(`/layaways/${MOCK_IDS.nonExistent}`)
        .set('Cookie', [`access_token=${token}`]);
      
      expect(response.status).toBe(404);
    });
  });

  describe('POST /layaways', () => {
    it('should create a new layaway', async () => {
      // Using predefined mock IDs defined at the top of the file
      
      const newLayaway = {
        totalAmount: 1000,
        initialPayment: 200,
        expectedDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        client: {
          id: MOCK_IDS.client,
          name: 'Test Client'
        },
        items: [
          {
            _id: MOCK_IDS.item,
            code: 'ITEM-001',
            name: 'Test Item',
            price: 1000,
            units: 1,
          }
        ],
        createdBy: {
          id: MOCK_IDS.user,
          name: 'Test User'
        },
        notes: 'Test layaway'
      };
      
      const response = await request(app)
        .post('/layaways')
        .set('Cookie', [`access_token=${token}`])
        .send(newLayaway);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('code');
      expect(response.body).toHaveProperty('status', LayawayStatus.ACTIVE);
      expect(response.body).toHaveProperty('remainingAmount');
    });

    it('should validate required fields', async () => {
      const invalidLayaway = {
        // Missing required fields
        initialPayment: 200
      };
      
      const response = await request(app)
        .post('/layaways')
        .set('Cookie', [`access_token=${token}`])
        .send(invalidLayaway);
      
      expect(response.status).toBe(422);
    });
  });

  describe('POST /layaways/:id/payments', () => {
    it('should add a payment to a layaway', async () => {
      
      const paymentData = {
        amount: 300,
        paymentMethod: 'BANK_TRANSFER',
        receiptNumber: 'REC-002',
        notes: 'Second payment',
        createdBy: {
          id: MOCK_IDS.user,
          name: 'Test User'
        }
      };
      
      const response = await request(app)
        .post(`/layaways/${MOCK_IDS.layaway}/payments`)
        .set('Cookie', [`access_token=${token}`])
        .send(paymentData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('paidAmount', 400);
      expect(response.body).toHaveProperty('remainingAmount', 600);
      expect(response.body.payments.length).toBe(2);
    });

    it('should validate payment data', async () => {
      
      const invalidPayment = {
        // Missing required fields
        paymentMethod: 'CASH'
        // Missing amount and createdBy
      };
      
      const response = await request(app)
        .post(`/layaways/${MOCK_IDS.layaway}/payments`)
        .set('Cookie', [`access_token=${token}`])
        .send(invalidPayment);
      
      expect(response.status).toBe(422);
    });
  });

  describe('GET /layaways/:id/payments', () => {
    it('should return all payments for a layaway', async () => {
      
      const response = await request(app)
        .get(`/layaways/${MOCK_IDS.layaway}/payments`)
        .set('Cookie', [`access_token=${token}`]);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('paymentMethod', 'CASH');
      expect(response.body[0]).toHaveProperty('amount', 200);
    });
  });

  describe('PUT /layaways/:id/status', () => {
    it('should mark a layaway as delivered', async () => {
      
      const statusUpdate = {
        status: LayawayStatus.DELIVERED
      };
      
      const response = await request(app)
        .patch(`/layaways/${MOCK_IDS.layaway}/status`)
        .set('Cookie', [`access_token=${token}`])
        .send(statusUpdate);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', LayawayStatus.DELIVERED);
    });

    it('should cancel a layaway with reason', async () => {
      
      const statusUpdate = {
        status: LayawayStatus.CANCELED,
        reason: 'Customer requested cancellation'
      };
      
      const response = await request(app)
        .patch(`/layaways/${MOCK_IDS.layaway}/status`)
        .set('Cookie', [`access_token=${token}`])
        .send(statusUpdate);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', LayawayStatus.CANCELED);
    });

    it('should require reason when canceling a layaway', async () => {
      
      const statusUpdate = {
        status: LayawayStatus.CANCELED
        // Missing reason
      };
      
      const response = await request(app)
        .patch(`/layaways/${MOCK_IDS.layaway}/status`)
        .set('Cookie', [`access_token=${token}`])
        .send(statusUpdate);
      
      expect(response.status).toBe(422);
    });

    it('should reject invalid status updates', async () => {
      
      const statusUpdate = {
        status: 'INVALID_STATUS'
      };
      
      const response = await request(app)
        .patch(`/layaways/${MOCK_IDS.layaway}/status`)
        .set('Cookie', [`access_token=${token}`])
        .send(statusUpdate);
      
      expect(response.status).toBe(422);
    });
  });
});
