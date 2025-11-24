import { Router } from 'express';
import { authenticate, requireOrganization } from '../middleware/auth';
import { LinkedInAccountModel } from '../models/LinkedInAccount';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(requireOrganization);

// List LinkedIn accounts
router.get('/', async (req: any, res) => {
  try {
    const { organizationId } = req.params;
    const accounts = await LinkedInAccountModel.findByOrganizationId(organizationId);
    res.json({ success: true, data: accounts });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch accounts', message: error.message });
  }
});

// Get account details
router.get('/:accountId', async (req: any, res) => {
  try {
    const { accountId } = req.params;
    const account = await LinkedInAccountModel.findById(accountId);

    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    res.json({ success: true, data: account });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch account', message: error.message });
  }
});

// Connect new account
router.post('/', async (req: any, res) => {
  try {
    const { organizationId } = req.params;
    const { accountType, name, username, profileUrl, credentials } = req.body;

    const account = await LinkedInAccountModel.create({
      organization_id: organizationId,
      account_type: accountType,
      name,
      username,
      profile_url: profileUrl,
      credentials,
      created_by: req.user.id,
    });

    res.status(201).json({ success: true, data: account });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to connect account', message: error.message });
  }
});

// Delete account
router.delete('/:accountId', async (req: any, res) => {
  try {
    const { accountId } = req.params;
    await LinkedInAccountModel.delete(accountId);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete account', message: error.message });
  }
});

export default router;
