import { describe, it, expect, vi } from 'vitest';
import { Pool } from 'pg';
import { PaymentsService } from './payments.service.js';

describe('PaymentsService', () => {
  it('findOne returns undefined when no row is found', async () => {
    // 1. Arrange: a fake pool whose query() resolves to "no rows"
    const fakePool = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    const service = new PaymentsService(fakePool as unknown as Pool);

    // 2. Act
    const result = await service.findOne('any-id');

    // 3. Assert
    expect(result).toBeUndefined();
  });

    it('findOne maps a snake_case row to a camelCase payment', async () => {
    // 1. Arrange: one fake row, shaped like the database (snake_case)
    const row = {
      id: 'abc-123',
      amount_kobo: 10,          // pick any number, e.g. 5000
      currency: 'NGN',
      status: 'pending',
      customer_email: 'divine@example.com',       // any email, in quotes
      description: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const fakePool = { query: vi.fn().mockResolvedValue({ rows: [ row ] }) };  // put the row inside the array
    const service = new PaymentsService(fakePool as unknown as Pool);

    // 2. Act
    const result = await service.findOne('abc-123');      // which method are we testing?

    // 3. Assert: the camelCase fields have the values from the row
    expect(result?.amountKobo).toBe(10);             // the same number you used above
    expect(result?.customerEmail).toBe('divine@example.com');          // the same email you used above
  });

  it('findAll uses the right offset for page 3', async () => {
    // 1. Arrange: findAll calls query() TWICE (list + count), so the fake needs two answers
    const fakePool = {
      query: vi.fn()
        .mockResolvedValueOnce({ rows: [] })                  // 1st call: the list query
        .mockResolvedValueOnce({ rows: [{ total: '0' }] }),   // 2nd call: the count query
    };
    const service = new PaymentsService(fakePool as unknown as Pool);

    // 2. Act
    await service.findAll({ page: 3, limit: 10 });

    // 3. Assert: the list query got [status, limit, offset]
    expect(fakePool.query).toHaveBeenCalledWith(expect.any(String), [null, 10, 20]);
  });

  it('findAll converts total to a number and works out totalPages', async () => {
    const fakePool = {
      query: vi.fn()
        .mockResolvedValueOnce({ rows: [] })                    // list query
        .mockResolvedValueOnce({ rows: [{ total: '25' }] }),     // count query: pg sends COUNT as a STRING, e.g. '25'
    };
    const service = new PaymentsService(fakePool as unknown as Pool);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.pagination.total).toBe(25);        // the NUMBER, no quotes
    expect(result.pagination.totalPages).toBe(3);   // 25 payments ÷ 10 per page, rounded UP
  });

});
