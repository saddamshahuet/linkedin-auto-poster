import { pgPool } from '../config/database';

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_start?: Date;
  current_period_end?: Date;
  cancel_at_period_end: boolean;
  trial_ends_at?: Date;
  seats_included: number;
  seats_used: number;
  created_at: Date;
  updated_at: Date;
}

export class SubscriptionModel {
  static async create(data: {
    organization_id: string;
    plan_id: string;
    status?: string;
    seats_included?: number;
  }): Promise<Subscription> {
    const result = await pgPool.query(
      `INSERT INTO subscriptions (organization_id, plan_id, status, seats_included)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.organization_id, data.plan_id, data.status || 'active', data.seats_included || 1]
    );

    return result.rows[0];
  }

  static async findById(id: string): Promise<Subscription | null> {
    const result = await pgPool.query('SELECT * FROM subscriptions WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByOrganizationId(organizationId: string): Promise<Subscription | null> {
    const result = await pgPool.query(
      'SELECT * FROM subscriptions WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1',
      [organizationId]
    );
    return result.rows[0] || null;
  }

  static async findByStripeSubscriptionId(
    stripeSubscriptionId: string
  ): Promise<Subscription | null> {
    const result = await pgPool.query(
      'SELECT * FROM subscriptions WHERE stripe_subscription_id = $1',
      [stripeSubscriptionId]
    );
    return result.rows[0] || null;
  }

  static async update(id: string, data: Partial<Subscription>): Promise<Subscription | null> {
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
      `UPDATE subscriptions SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async incrementSeatsUsed(subscriptionId: string): Promise<void> {
    await pgPool.query('UPDATE subscriptions SET seats_used = seats_used + 1 WHERE id = $1', [
      subscriptionId,
    ]);
  }

  static async decrementSeatsUsed(subscriptionId: string): Promise<void> {
    await pgPool.query(
      'UPDATE subscriptions SET seats_used = GREATEST(0, seats_used - 1) WHERE id = $1',
      [subscriptionId]
    );
  }

  static async cancel(id: string, immediately: boolean = false): Promise<void> {
    if (immediately) {
      await pgPool.query(
        `UPDATE subscriptions SET status = 'canceled', updated_at = NOW() WHERE id = $1`,
        [id]
      );
    } else {
      await pgPool.query(
        `UPDATE subscriptions SET cancel_at_period_end = true, updated_at = NOW() WHERE id = $1`,
        [id]
      );
    }
  }
}
