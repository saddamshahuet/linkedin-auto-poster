import { pgPool } from '../config/database';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  created_by: string;
  settings: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'manager' | 'creator' | 'viewer';
  invited_by?: string;
  invited_at?: Date;
  joined_at?: Date;
  created_at: Date;
}

export class OrganizationModel {
  static async create(data: {
    name: string;
    slug: string;
    created_by: string;
    settings?: Record<string, any>;
  }): Promise<Organization> {
    const result = await pgPool.query(
      `INSERT INTO organizations (name, slug, created_by, settings)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.name, data.slug, data.created_by, data.settings || {}]
    );

    return result.rows[0];
  }

  static async findById(id: string): Promise<Organization | null> {
    const result = await pgPool.query(
      'SELECT * FROM organizations WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findBySlug(slug: string): Promise<Organization | null> {
    const result = await pgPool.query(
      'SELECT * FROM organizations WHERE slug = $1 AND deleted_at IS NULL',
      [slug]
    );
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string): Promise<Organization[]> {
    const result = await pgPool.query(
      `SELECT o.* FROM organizations o
       INNER JOIN organization_members om ON o.id = om.organization_id
       WHERE om.user_id = $1 AND o.deleted_at IS NULL
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async update(id: string, data: Partial<Organization>): Promise<Organization | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pgPool.query(
      `UPDATE organizations SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async addMember(data: {
    organization_id: string;
    user_id: string;
    role: string;
    invited_by?: string;
  }): Promise<OrganizationMember> {
    const result = await pgPool.query(
      `INSERT INTO organization_members (organization_id, user_id, role, invited_by, joined_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [data.organization_id, data.user_id, data.role, data.invited_by]
    );

    return result.rows[0];
  }

  static async getMember(
    organizationId: string,
    userId: string
  ): Promise<OrganizationMember | null> {
    const result = await pgPool.query(
      `SELECT * FROM organization_members
       WHERE organization_id = $1 AND user_id = $2`,
      [organizationId, userId]
    );
    return result.rows[0] || null;
  }

  static async getMembers(organizationId: string): Promise<OrganizationMember[]> {
    const result = await pgPool.query(
      `SELECT om.*, u.email, u.first_name, u.last_name, u.avatar_url
       FROM organization_members om
       INNER JOIN users u ON om.user_id = u.id
       WHERE om.organization_id = $1
       ORDER BY om.created_at ASC`,
      [organizationId]
    );
    return result.rows;
  }

  static async updateMemberRole(
    organizationId: string,
    userId: string,
    role: string
  ): Promise<void> {
    await pgPool.query(
      `UPDATE organization_members SET role = $1 WHERE organization_id = $2 AND user_id = $3`,
      [role, organizationId, userId]
    );
  }

  static async removeMember(organizationId: string, userId: string): Promise<void> {
    await pgPool.query(
      `DELETE FROM organization_members WHERE organization_id = $1 AND user_id = $2`,
      [organizationId, userId]
    );
  }

  static async delete(id: string): Promise<void> {
    await pgPool.query('UPDATE organizations SET deleted_at = NOW() WHERE id = $1', [id]);
  }
}
