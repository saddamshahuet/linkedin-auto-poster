import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { OrganizationModel } from '../models/Organization';

const router = Router();

router.use(authenticate);

// List user's organizations
router.get('/', async (req: any, res) => {
  try {
    const organizations = await OrganizationModel.findByUserId(req.user.id);
    res.json({ success: true, data: organizations });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch organizations', message: error.message });
  }
});

// Get organization details
router.get('/:organizationId', async (req: any, res) => {
  try {
    const { organizationId } = req.params;
    const organization = await OrganizationModel.findById(organizationId);

    if (!organization) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }

    const member = await OrganizationModel.getMember(organizationId, req.user.id);
    if (!member) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ success: true, data: organization });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch organization', message: error.message });
  }
});

// Get organization members
router.get('/:organizationId/members', async (req: any, res) => {
  try {
    const { organizationId } = req.params;

    const member = await OrganizationModel.getMember(organizationId, req.user.id);
    if (!member) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const members = await OrganizationModel.getMembers(organizationId);
    res.json({ success: true, data: members });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch members', message: error.message });
  }
});

// Add organization member
router.post('/:organizationId/members', async (req: any, res) => {
  try {
    const { organizationId } = req.params;
    const { userId, role } = req.body;

    const member = await OrganizationModel.getMember(organizationId, req.user.id);
    if (!member || !['owner', 'admin'].includes(member.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const newMember = await OrganizationModel.addMember({
      organization_id: organizationId,
      user_id: userId,
      role,
      invited_by: req.user.id,
    });

    res.status(201).json({ success: true, data: newMember });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to add member', message: error.message });
  }
});

export default router;
