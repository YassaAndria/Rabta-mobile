import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import jwt from 'jsonwebtoken';

export const login = catchAsync(async (req: Request, res: Response) => {
  const { user, token, profileComplete } = await authService.loginUser(req.body.email, req.body.password);
  res.status(200).json({ 
    status: 'success', 
    data: { user, token, profileComplete } 
  });
});

export const register = catchAsync(async (req: Request, res: Response) => {
  const { user, token } = await authService.registerUser(req.body);
  res.status(201).json({ 
    status: 'success', 
    data: { user, token } 
  });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  res.status(200).json({ 
    status: 'success', 
    message: 'Reset link sent to email' 
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { user, token } = await authService.resetPassword(req.params.token as string, req.body.password);
  res.status(200).json({ 
    status: 'success', 
    message: 'Password updated successfully',
    data: { user, token }
  });
});

export const googleAuthCallback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Google login failed', 401));
  const user = req.user as any;
  const token = authService.signToken(user._id.toString());
  
  // We should also check profileComplete for Google users
  const profileComplete = user.profileComplete;
  
  // توجيه المستخدم للفرونت إند (React) مع التوكن وحالة البروفايل
  res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${token}&profileComplete=${profileComplete}`);
});

/**
 * Mobile Google Auth — accepts a Google ID token from Expo AuthSession,
 * verifies it via Google's tokeninfo endpoint, then finds/links the user
 * and returns a JWT. This avoids the broken server-side redirect flow on mobile.
 */
export const googleMobileAuth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { idToken } = req.body;

  if (!idToken) {
    return next(new AppError('Google ID token is required', 400));
  }

  // Verify the token with Google
  const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  if (!googleRes.ok) {
    return next(new AppError('Invalid Google token', 401));
  }

  const payload = await googleRes.json();
  const email = payload.email;
  const googleId = payload.sub;

  if (!email) {
    return next(new AppError('Could not retrieve email from Google', 401));
  }

  // Verify the token was issued for our client ID
  const expectedClientId = process.env.GOOGLE_CLIENT_ID;
  if (payload.aud !== expectedClientId) {
    return next(new AppError('Token was not issued for this application', 401));
  }

  // Find the user
  const { User } = require('../models/user');
  let user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('This account is not registered. Please create an account first.', 401));
  }

  // Link Google ID if not already linked
  if (!user.googleId) {
    user.googleId = googleId;
    await user.save();
  }

  const token = authService.signToken(user._id.toString());
  const profileComplete = user.profileComplete;

  res.status(200).json({
    status: 'success',
    data: { user, token, profileComplete }
  });
});