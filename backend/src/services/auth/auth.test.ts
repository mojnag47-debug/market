import { authService } from './authService';
import { prisma } from '../../shared/database';
import { UserRole, ConflictError, UnauthorizedError, NotFoundError } from '../../shared/types';
import bcrypt from 'bcryptjs';

// Mock Prisma
jest.mock('../../shared/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock('bcryptjs');

// Mock JWT functions
jest.mock('../../middleware/auth', () => ({
  generateTokens: jest.fn(() => ({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  })),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '09123456789',
      role: UserRole.CUSTOMER,
    };

    it('should register a new user successfully', async () => {
      // Mock user doesn't exist
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      
      // Mock password hashing
      mockBcrypt.hash.mockResolvedValue('hashed-password' as never);
      
      // Mock user creation
      const mockUser = {
        id: 'user-id',
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        phoneNumber: registerData.phoneNumber,
        username: null,
        role: UserRole.CUSTOMER,
        isActive: true,
        emailVerified: null,
        phoneVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockPrisma.user.create.mockResolvedValue(mockUser as never);

      const result = await authService.register(registerData);

      expect(result.success).toBe(true);
      expect(result.data?.user.email).toBe(registerData.email);
      expect(result.data?.tokens).toBeDefined();
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerData.email,
          password: 'hashed-password',
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          phoneNumber: registerData.phoneNumber,
          role: UserRole.CUSTOMER,
        },
        select: expect.any(Object),
      });
    });

    it('should throw ConflictError if email already exists', async () => {
      // Mock existing user
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing-user' } as never);

      await expect(authService.register(registerData)).rejects.toThrow(ConflictError);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictError if phone number already exists', async () => {
      // Mock email doesn't exist but phone does
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing-user' } as never);

      await expect(authService.register(registerData)).rejects.toThrow(ConflictError);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-id',
        email: loginData.email,
        password: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '09123456789',
        username: null,
        role: UserRole.CUSTOMER,
        isActive: true,
        emailVerified: null,
        phoneVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as never);
      mockBcrypt.compare.mockResolvedValue(true as never);

      const result = await authService.login(loginData);

      expect(result.success).toBe(true);
      expect(result.data?.user.email).toBe(loginData.email);
      expect(result.data?.tokens).toBeDefined();
      expect(mockBcrypt.compare).toHaveBeenCalledWith(loginData.password, 'hashed-password');
    });

    it('should throw UnauthorizedError for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for inactive user', async () => {
      const mockUser = {
        id: 'user-id',
        email: loginData.email,
        password: 'hashed-password',
        isActive: false,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as never);

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for invalid password', async () => {
      const mockUser = {
        id: 'user-id',
        email: loginData.email,
        password: 'hashed-password',
        isActive: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as never);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('changePassword', () => {
    const userId = 'user-id';
    const currentPassword = 'oldPassword123';
    const newPassword = 'newPassword123';

    it('should change password successfully', async () => {
      const mockUser = {
        password: 'hashed-old-password',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as never);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockBcrypt.hash.mockResolvedValue('hashed-new-password' as never);
      mockPrisma.user.update.mockResolvedValue({} as never);

      const result = await authService.changePassword(userId, currentPassword, newPassword);

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('Password changed successfully');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { password: 'hashed-new-password' },
      });
    });

    it('should throw NotFoundError if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.changePassword(userId, currentPassword, newPassword))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw UnauthorizedError for incorrect current password', async () => {
      const mockUser = {
        password: 'hashed-old-password',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as never);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(authService.changePassword(userId, currentPassword, newPassword))
        .rejects.toThrow(UnauthorizedError);
    });
  });

  describe('getProfile', () => {
    const userId = 'user-id';

    it('should return user profile successfully', async () => {
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '09123456789',
        username: null,
        role: UserRole.CUSTOMER,
        isActive: true,
        emailVerified: null,
        phoneVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as never);

      const result = await authService.getProfile(userId);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(userId);
      expect(result.data?.email).toBe('test@example.com');
    });

    it('should throw NotFoundError if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.getProfile(userId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateProfile', () => {
    const userId = 'user-id';
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      phoneNumber: '09987654321',
    };

    it('should update profile successfully', async () => {
      const mockUpdatedUser = {
        id: userId,
        email: 'test@example.com',
        firstName: 'Updated',
        lastName: 'Name',
        phoneNumber: '09987654321',
        username: null,
        role: UserRole.CUSTOMER,
        isActive: true,
        emailVerified: null,
        phoneVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock no existing phone conflict
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.update.mockResolvedValue(mockUpdatedUser as never);

      const result = await authService.updateProfile(userId, updateData);

      expect(result.success).toBe(true);
      expect(result.data?.firstName).toBe('Updated');
      expect(result.data?.phoneNumber).toBe('09987654321');
    });

    it('should throw ConflictError if phone number already exists', async () => {
      // Mock existing phone number
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'other-user' } as never);

      await expect(authService.updateProfile(userId, updateData)).rejects.toThrow(ConflictError);
    });

    it('should throw ConflictError if username already exists', async () => {
      const updateWithUsername = {
        ...updateData,
        username: 'existing_username',
      };

      // Mock phone check passes but username exists
      mockPrisma.user.findFirst
        .mockResolvedValueOnce(null) // Phone check
        .mockResolvedValueOnce({ id: 'other-user' } as never); // Username check

      await expect(authService.updateProfile(userId, updateWithUsername))
        .rejects.toThrow(ConflictError);
    });
  });

  describe('forgotPassword', () => {
    const email = 'test@example.com';

    it('should return success message regardless of email existence', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await authService.forgotPassword(email);

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('password reset link has been sent');
    });

    it('should return success message for existing user', async () => {
      const mockUser = {
        id: 'user-id',
        email,
        isActive: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as never);

      const result = await authService.forgotPassword(email);

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('password reset link has been sent');
    });
  });

  describe('verifyEmail', () => {
    const userId = 'user-id';

    it('should verify email successfully', async () => {
      mockPrisma.user.update.mockResolvedValue({} as never);

      const result = await authService.verifyEmail(userId);

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('Email verified successfully');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { emailVerified: expect.any(Date) },
      });
    });
  });

  describe('verifyPhone', () => {
    const userId = 'user-id';

    it('should verify phone successfully', async () => {
      mockPrisma.user.update.mockResolvedValue({} as never);

      const result = await authService.verifyPhone(userId);

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('Phone verified successfully');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { phoneVerified: expect.any(Date) },
      });
    });
  });
});

describe('Token Rotation', () => {
  it('should rotate refresh tokens and invalidate previous', async () => {
    const { refreshToken } = await authService.login(validUser);
    const newTokens = await authService.refreshTokens(refreshToken);
    
    await expect(authService.refreshTokens(refreshToken))
      .rejects.toThrow(UnauthorizedError);
    expect(newTokens).toHaveProperty('access_token');
    expect(newTokens).toHaveProperty('refresh_token');
  });
});

describe('Error Handling', () => {
  it('should log 500 errors with OpenTelemetry spans', async () => {
    const error = new Error('Test error');
    const mockSpan = { setAttribute: jest.fn(), end: jest.fn() };
    
    jest.spyOn(trace, 'getTracer').mockReturnValue({
      startActiveSpan: (name, cb) => cb(mockSpan)
    } as any);

    await testErrorHandler(error, 500);
    
    expect(mockSpan.setAttribute).toHaveBeenCalledWith('error.severity', 'high');
  });
});