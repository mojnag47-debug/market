import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../shared/database';
import { generateTokens } from '../../middleware/auth';
import {
  AppError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  UserRole,
  ServiceResponse,
} from '../../shared/types';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  username: string | null;
  role: UserRole;
  isActive: boolean;
  emailVerified: Date | null;
  phoneVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

class AuthService {
  async register(data: RegisterData): Promise<ServiceResponse<AuthResponse>> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Check phone number if provided
      if (data.phoneNumber) {
        const existingPhone = await prisma.user.findUnique({
          where: { phoneNumber: data.phoneNumber },
        });

        if (existingPhone) {
          throw new ConflictError('User with this phone number already exists');
        }
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          role: data.role || UserRole.CUSTOMER,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          username: true,
          role: true,
          isActive: true,
          emailVerified: true,
          phoneVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Generate tokens
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role as UserRole,
      });

      return {
        success: true,
        data: {
          user: user as UserProfile,
          tokens,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Registration failed', 500);
    }
  }

  async login(data: LoginData): Promise<ServiceResponse<AuthResponse>> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        select: {
          id: true,
          email: true,
          password: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          username: true,
          role: true,
          isActive: true,
          emailVerified: true,
          phoneVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      if (!user.isActive) {
        throw new UnauthorizedError('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Generate tokens
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role as UserRole,
      });

      // Remove password from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          user: userWithoutPassword as UserProfile,
          tokens,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Login failed', 500);
    }
  }

  async refreshToken(refreshToken: string): Promise<ServiceResponse<{ accessToken: string }>> {
    try {
      // Note: In production, you might want to store refresh tokens in Redis
      // and validate them there for better security and revocation capabilities
      
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new AppError('JWT configuration error', 500);
      }

      // For now, we'll just generate a new access token from the refresh token
      // In production, implement proper refresh token rotation
      const tokens = generateTokens({
        userId: 'temp',
        email: 'temp@example.com',
        role: UserRole.CUSTOMER,
      });

      return {
        success: true,
        data: {
          accessToken: tokens.accessToken,
        },
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async forgotPassword(email: string): Promise<ServiceResponse<{ message: string }>> {
    try {
      const user = await prisma.user.findUnique({
        where: { email, isActive: true },
      });

      if (!user) {
        // Don't reveal if email exists or not for security
        return {
          success: true,
          data: {
            message: 'If an account with that email exists, a password reset link has been sent.',
          },
        };
      }

      // Generate reset token
      const resetToken = uuidv4();
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      // In a real implementation, you would:
      // 1. Store the reset token in database or cache
      // 2. Send email with reset link
      
      // For now, just return success message
      return {
        success: true,
        data: {
          message: 'If an account with that email exists, a password reset link has been sent.',
        },
      };
    } catch (error) {
      throw new AppError('Password reset request failed', 500);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<ServiceResponse<{ message: string }>> {
    try {
      // In a real implementation, you would:
      // 1. Verify the reset token from database/cache
      // 2. Check if it's not expired
      // 3. Update the user's password
      
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // For demonstration purposes, assuming token validation passed
      // const user = await prisma.user.update({
      //   where: { resetToken: token },
      //   data: { 
      //     password: hashedPassword,
      //     resetToken: null,
      //     resetExpires: null 
      //   },
      // });

      return {
        success: true,
        data: {
          message: 'Password reset successfully',
        },
      };
    } catch (error) {
      throw new AppError('Password reset failed', 500);
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<ServiceResponse<{ message: string }>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedError('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return {
        success: true,
        data: {
          message: 'Password changed successfully',
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Password change failed', 500);
    }
  }

  async getProfile(userId: string): Promise<ServiceResponse<UserProfile>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId, isActive: true },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          username: true,
          role: true,
          isActive: true,
          emailVerified: true,
          phoneVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return {
        success: true,
        data: user as UserProfile,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get user profile', 500);
    }
  }

  async updateProfile(
    userId: string,
    data: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'phoneNumber' | 'username'>>
  ): Promise<ServiceResponse<UserProfile>> {
    try {
      // Check if phone number is being updated and already exists
      if (data.phoneNumber) {
        const existingPhone = await prisma.user.findFirst({
          where: {
            phoneNumber: data.phoneNumber,
            id: { not: userId },
          },
        });

        if (existingPhone) {
          throw new ConflictError('Phone number already exists');
        }
      }

      // Check if username is being updated and already exists
      if (data.username) {
        const existingUsername = await prisma.user.findFirst({
          where: {
            username: data.username,
            id: { not: userId },
          },
        });

        if (existingUsername) {
          throw new ConflictError('Username already exists');
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          username: true,
          role: true,
          isActive: true,
          emailVerified: true,
          phoneVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        success: true,
        data: updatedUser as UserProfile,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Profile update failed', 500);
    }
  }

  async verifyEmail(userId: string): Promise<ServiceResponse<{ message: string }>> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() },
      });

      return {
        success: true,
        data: {
          message: 'Email verified successfully',
        },
      };
    } catch (error) {
      throw new AppError('Email verification failed', 500);
    }
  }

  async verifyPhone(userId: string): Promise<ServiceResponse<{ message: string }>> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { phoneVerified: new Date() },
      });

      return {
        success: true,
        data: {
          message: 'Phone verified successfully',
        },
      };
    } catch (error) {
      throw new AppError('Phone verification failed', 500);
    }
  }
}

export const authService = new AuthService();