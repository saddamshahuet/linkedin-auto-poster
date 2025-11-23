import { pgPool } from '../config/database';
import bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  timezone: string;
  locale: string;
  email_verified: boolean;
  mfa_enabled: boolean;
  mfa_secret?: string;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
  deleted_at?: Date;
}

export class UserModel {
  static async create(data: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }): Promise<User> {
    const password_hash = await bcrypt.hash(data.password, 12);

    const result = await pgPool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.email, password_hash, data.first_name, data.last_name]
    );

    return result.rows[0];
  }

  static async findById(id: string): Promise<User | null> {
    const result = await pgPool.query(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pgPool.query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );
    return result.rows[0] || null;
  }

  static async update(id: string, data: Partial<User>): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pgPool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.password_hash) return false;
    return bcrypt.compare(password, user.password_hash);
  }

  static async updateLastLogin(id: string): Promise<void> {
    await pgPool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [id]);
  }

  static async delete(id: string): Promise<void> {
    await pgPool.query('UPDATE users SET deleted_at = NOW() WHERE id = $1', [id]);
  }
}
