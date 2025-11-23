import { Router } from 'express';
import { PostsController } from '../controllers/postsController';
import { authenticate, requireOrganization } from '../middleware/auth';

const router = Router({ mergeParams: true });

// All routes require authentication and organization membership
router.use(authenticate);
router.use(requireOrganization);

router.post('/', PostsController.create);
router.get('/', PostsController.list);
router.get('/scheduled', PostsController.getScheduled);
router.get('/:postId', PostsController.getById);
router.patch('/:postId', PostsController.update);
router.delete('/:postId', PostsController.delete);
router.post('/:postId/publish', PostsController.publish);

export default router;
