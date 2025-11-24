import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { OrganizationModel } from '../models/Organization';
import { SubscriptionModel } from '../models/Subscription';
import { generateToken, generateRefreshToken } from '../middleware/auth';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, organizationName } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ error: 'User already exists' });
        return;
      }

      // Create user
      const user = await UserModel.create({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });

      // Create default organization
      const orgName = organizationName || `${firstName || email.split('@')[0]}'s Organization`;
      const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

      const organization = await OrganizationModel.create({
        name: orgName,
        slug,
        created_by: user.id,
      });

      // Add user as owner
      await OrganizationModel.addMember({
        organization_id: organization.id,
        user_id: user.id,
        role: 'owner',
      });

      // Create free subscription
      await SubscriptionModel.create({
        organization_id: organization.id,
        plan_id: 'free',
        status: 'active',
        seats_included: 1,
      });

      // Generate tokens
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
          },
          organization: {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
          },
          token,
          refreshToken,
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed', message: error.message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const isValidPassword = await UserModel.verifyPassword(user, password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Check MFA
      if (user.mfa_enabled) {
        // Return temporary token for MFA verification
        const mfaToken = generateToken(user.id);
        res.json({
          success: true,
          mfaRequired: true,
          mfaToken,
        });
        return;
      }

      // Update last login
      await UserModel.updateLastLogin(user.id);

      // Get organizations
      const organizations = await OrganizationModel.findByUserId(user.id);

      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            avatarUrl: user.avatar_url,
            timezone: user.timezone,
            locale: user.locale,
          },
          organizations: organizations.map((org) => ({
            id: org.id,
            name: org.name,
            slug: org.slug,
            logoUrl: org.logo_url,
          })),
          token,
          refreshToken,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed', message: error.message });
    }
  }

  static async verifyMFA(req: Request, res: Response): Promise<void> {
    try {
      const { mfaToken, code } = req.body;

      if (!mfaToken || !code) {
        res.status(400).json({ error: 'MFA token and code are required' });
        return;
      }

      // Verify MFA token
      const decoded = require('jsonwebtoken').verify(
        mfaToken,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as { userId: string };

      const user = await UserModel.findById(decoded.userId);
      if (!user || !user.mfa_enabled || !user.mfa_secret) {
        res.status(401).json({ error: 'Invalid MFA token' });
        return;
      }

      // Verify TOTP code
      const verified = speakeasy.totp.verify({
        secret: user.mfa_secret,
        encoding: 'base32',
        token: code,
        window: 2,
      });

      if (!verified) {
        res.status(401).json({ error: 'Invalid MFA code' });
        return;
      }

      await UserModel.updateLastLogin(user.id);

      const organizations = await OrganizationModel.findByUserId(user.id);

      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
          },
          organizations,
          token,
          refreshToken,
        },
      });
    } catch (error: any) {
      console.error('MFA verification error:', error);
      res.status(500).json({ error: 'MFA verification failed', message: error.message });
    }
  }

  static async setupMFA(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const secret = speakeasy.generateSecret({
        name: `LinkedIn Auto Poster (${user.email})`,
        issuer: 'LinkedIn Auto Poster',
      });

      // Store secret temporarily (will be confirmed on verification)
      await UserModel.update(userId, { mfa_secret: secret.base32 });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

      res.json({
        success: true,
        data: {
          secret: secret.base32,
          qrCode: qrCodeUrl,
        },
      });
    } catch (error: any) {
      console.error('MFA setup error:', error);
      res.status(500).json({ error: 'MFA setup failed', message: error.message });
    }
  }

  static async confirmMFA(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { code } = req.body;

      if (!userId || !code) {
        res.status(400).json({ error: 'Code is required' });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user || !user.mfa_secret) {
        res.status(400).json({ error: 'MFA not initialized' });
        return;
      }

      const verified = speakeasy.totp.verify({
        secret: user.mfa_secret,
        encoding: 'base32',
        token: code,
        window: 2,
      });

      if (!verified) {
        res.status(400).json({ error: 'Invalid code' });
        return;
      }

      await UserModel.update(userId, { mfa_enabled: true });

      res.json({
        success: true,
        message: 'MFA enabled successfully',
      });
    } catch (error: any) {
      console.error('MFA confirmation error:', error);
      res.status(500).json({ error: 'MFA confirmation failed', message: error.message });
    }
  }

  static async disableMFA(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { password } = req.body;

      if (!userId || !password) {
        res.status(400).json({ error: 'Password is required' });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const isValidPassword = await UserModel.verifyPassword(user, password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid password' });
        return;
      }

      await UserModel.update(userId, { mfa_enabled: false, mfa_secret: undefined });

      res.json({
        success: true,
        message: 'MFA disabled successfully',
      });
    } catch (error: any) {
      console.error('MFA disable error:', error);
      res.status(500).json({ error: 'MFA disable failed', message: error.message });
    }
  }

  static async me(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const organizations = await OrganizationModel.findByUserId(userId);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            avatarUrl: user.avatar_url,
            timezone: user.timezone,
            locale: user.locale,
            emailVerified: user.email_verified,
            mfaEnabled: user.mfa_enabled,
          },
          organizations: organizations.map((org) => ({
            id: org.id,
            name: org.name,
            slug: org.slug,
            logoUrl: org.logo_url,
          })),
        },
      });
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user', message: error.message });
    }
  }
}
