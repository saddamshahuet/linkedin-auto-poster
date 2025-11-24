import { pgPool } from '../config/database';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key';
const ALGORITHM = 'aes-256-cbc';

export interface LinkedInAccount {
  id: string;
  organization_id: string;
  account_type: 'profile' | 'company_page';
  linkedin_id?: string;
  name: string;
  username?: string;
  profile_url?: string;
  avatar_url?: string;
  credentials_encrypted?: string;
  oauth_token_encrypted?: string;
  connection_status: 'active' | 'expired' | 'error';
  last_verified_at?: Date;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export class LinkedInAccountModel {
  static async create(data: {
    organization_id: string;
    account_type: string;
    name: string;
    username?: string;
    profile_url?: string;
    credentials?: any;
    oauth_token?: string;
    created_by: string;
  }): Promise<LinkedInAccount> {
    const credentials_encrypted = data.credentials
      ? encrypt(JSON.stringify(data.credentials))
      : null;
    const oauth_token_encrypted = data.oauth_token ? encrypt(data.oauth_token) : null;

    const result = await pgPool.query(
      `INSERT INTO linkedin_accounts
       (organization_id, account_type, name, username, profile_url, credentials_encrypted, oauth_token_encrypted, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.organization_id,
        data.account_type,
        data.name,
        data.username,
        data.profile_url,
        credentials_encrypted,
        oauth_token_encrypted,
        data.created_by,
      ]
    );

    return result.rows[0];
  }

  static async findById(id: string): Promise<LinkedInAccount | null> {
    const result = await pgPool.query('SELECT * FROM linkedin_accounts WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByOrganizationId(organizationId: string): Promise<LinkedInAccount[]> {
    const result = await pgPool.query(
      'SELECT * FROM linkedin_accounts WHERE organization_id = $1 ORDER BY created_at DESC',
      [organizationId]
    );
    return result.rows;
  }

  static async getCredentials(account: LinkedInAccount): Promise<any> {
    if (!account.credentials_encrypted) return null;
    return JSON.parse(decrypt(account.credentials_encrypted));
  }

  static async getOAuthToken(account: LinkedInAccount): Promise<string | null> {
    if (!account.oauth_token_encrypted) return null;
    return decrypt(account.oauth_token_encrypted);
  }

  static async update(id: string, data: Partial<LinkedInAccount>): Promise<LinkedInAccount | null> {
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
      `UPDATE linkedin_accounts SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async updateConnectionStatus(
    id: string,
    status: 'active' | 'expired' | 'error'
  ): Promise<void> {
    await pgPool.query(
      'UPDATE linkedin_accounts SET connection_status = $1, last_verified_at = NOW() WHERE id = $2',
      [status, id]
    );
  }

  static async delete(id: string): Promise<void> {
    await pgPool.query('DELETE FROM linkedin_accounts WHERE id = $1', [id]);
  }

  static async countByOrganization(organizationId: string): Promise<number> {
    const result = await pgPool.query(
      'SELECT COUNT(*) FROM linkedin_accounts WHERE organization_id = $1',
      [organizationId]
    );
    return parseInt(result.rows[0].count, 10);
  }
}
