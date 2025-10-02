import { Response } from 'express';
import { authService } from './authService';
import { AuthenticatedRequest, ApiResponse } from '../../shared/types';
import { asyncHandler } from '../../middleware/errorHandler';

class AuthController {
  register = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await authService.register(req.body);
    
    const response: ApiResponse = {
      success: result.success,
      message: 'User registered successfully',
      data: result.data,
      timestamp: new Date().toISOString(),
      path: req.path,
    };
    
    res.status(201).json(response);
  });

  login = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await authService.login(req.body);
    
    const response: ApiResponse = {
      success: result.success,
      message: 'Login successful',
      data: result.data,
      timestamp: new Date().toISOString(),
      path: req.path,
    };
    
    res.status(200).json(response);
  });

  refreshToken = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    
    const response: ApiResponse = {
      success: result.success,
      message: 'Token refreshed successfully',
      data: result.data,
      timestamp: new Date().toISOString(),
      path: req.path,
    };
    
    res.status(200).json(response);
  });

  forgotPassword = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    
    const response: ApiResponse = {
      success: result.success,
      message: result.data?.message || 'Password reset email sent',
      timestamp: new Date().toISOString(),
      path: req.path,
    };
    
    res.status(200).json(response);
  });

  resetPassword = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    
    const response: ApiResponse = {
      success: result.success,
      message: result.data?.message || 'Password reset successfully',
      timestamp: new Date().toISOString(),
      path: req.path,
    };
    
    res.status(200).json(response);
  });

  changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;
    
    const result = await authService.changePassword(userId, currentPassword, newPassword);
    
    const response: ApiResponse = {
      success: result.success,
      message: result.data?.message || 'Password changed successfully',
      timestamp: new Date().toISOString(),
      path: req.path,
    };
    
    res.status(200).json(response);
  });

  getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const result = await authService.getProfile(userId);
    
    const response: ApiResponse = {
      success: result.success,
      message: 'Profile retrieved successfully',
      data: result.data,
      timestamp: new Date().toISOString(),
      path: req.path,
    };
    
    res.status(200).json(response);
  });

  updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const result = await authService.updateProfile(userId, req.body);
    
    const response: ApiResponse = {
      success: result.success,
      message: 'Profile updated successfully',
      data: result.data,
      timestamp: new Date().toISOString(),
      path: req.path,
    };
    
    res.status(200).json(response);
  });

  verifyEmail = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const result = await authService.verifyEmail(userId);
    
    const response: ApiResponse = {
      success: result.success,
      message: result.data?.message || 'Email verified successfully',
      timestamp: new Date().toISOString(),
      path: req.path,
    };
    
    res.status(200).json(response);
  });

  verifyPhone = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const result = await authService.verifyPhone(userId);
    
    const response: ApiResponse = {
      success: result.success,
      message: result.data?.message || 'Phone verified successfully',
      timestamp: new Date().toISOString(),
      path: req.path,
    };
    
    res.status(200).json(response);
  });

  logout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // In a real implementation, you would:
    // 1. Invalidate the refresh token in Redis/database
    // 2. Add the access token to a blacklist (if needed)
    // 3. Clear any session data
    
    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
      path: req.path,
    };
    
    res.status(200).json(response);
  });
}

export const authController = new AuthController();