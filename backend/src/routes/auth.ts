import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/verify-mfa', AuthController.verifyMFA);
router.get('/me', authenticate, AuthController.me);
router.post('/mfa/setup', authenticate, AuthController.setupMFA);
router.post('/mfa/confirm', authenticate, AuthController.confirmMFA);
router.post('/mfa/disable', authenticate, AuthController.disableMFA);

export default router;
