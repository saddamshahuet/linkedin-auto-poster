import { Router } from 'express';
import { authenticate, requireOrganization } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(requireOrganization);

// Generate content with AI
router.post('/generate', async (req: any, res) => {
  try {
    const { prompt, tone, length, hashtags } = req.body;

    const { ContentGeneratorService } = require('../services/contentGenerator');
    const generator = new ContentGeneratorService();

    const content = await generator.generate({
      prompt,
      tone: tone || 'professional',
      length: length || 'medium',
      includeHashtags: hashtags !== false,
    });

    res.json({
      success: true,
      data: content,
    });
  } catch (error: any) {
    console.error('Content generation error:', error);
    res.status(500).json({ error: 'Failed to generate content', message: error.message });
  }
});

// List templates
router.get('/templates', async (req: any, res) => {
  try {
    const { organizationId } = req.params;
    const { pgPool } = require('../config/database');

    const result = await pgPool.query(
      'SELECT * FROM content_templates WHERE organization_id = $1 OR is_public = true ORDER BY created_at DESC',
      [organizationId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch templates', message: error.message });
  }
});

// Create template
router.post('/templates', async (req: any, res) => {
  try {
    const { organizationId } = req.params;
    const { name, description, content, category, variables } = req.body;
    const { pgPool } = require('../config/database');

    const result = await pgPool.query(
      `INSERT INTO content_templates (organization_id, name, description, content, category, variables, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [organizationId, name, description, content, category, variables || [], req.user.id]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create template', message: error.message });
  }
});

export default router;
