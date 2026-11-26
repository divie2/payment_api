import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { setupApp } from '../src/setup-app.js';
import { Pool } from 'pg';
import { PG_POOL } from '../src/database/database.module.js';

describe('Payments API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    setupApp(app)

    await app.init();

    // Start every test from an empty table, so results are predictable
    const pool = app.get<Pool>(PG_POOL);
    await pool.query('TRUNCATE payments');
  });

  it('GET /health returns 200', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200);
  });

  it('GET /payments/:id with an unknown uuid returns 404', () => {
    return request(app.getHttpServer())
      .get('/payments/00000000-0000-4000-8000-000000000000')
      .expect(404);
  });

  it('POST /payments with a bad body returns 400', () => {
    return request(app.getHttpServer())
      .post('/payments')
      .send({ amountKobo: -5, customerEmail: 'not-an-email' })
      .expect(400);
  });

  it('POST then GET: a created payment can be read back', async () => {
    // 1. Create a payment
    const created = await request(app.getHttpServer())
      .post('/payments')
      .send({ amountKobo: 7500, customerEmail: 'e2e@example.com' })
      .expect(201);                       // which status code means "created"?

    // 2. Read it back using the id the API gave us
    const id = created.body.id;          // which field holds the new payment's id?

    const fetched = await request(app.getHttpServer())
      .get(`/payments/${id}`)
      .expect(200);

    

    // 3. Check the data survived the trip
    expect(fetched.body.amountKobo).toBe(7500);
    expect(fetched.body.status).toBe('pending');   // what status does every new payment start with?  
  });

it('GET /payments?page=0 should return 400', async () => {
  await request(app.getHttpServer()) // Use `request(app)` if using plain Express
    .get('/payments?page=0')
    .expect(400);
});

it('GET /payments/summary counts exactly what is in the table', async () => {
  // The table is empty (TRUNCATE in beforeEach), so we know the exact answer
  const empty = await request(app.getHttpServer())
    .get('/payments/summary')
    .expect(200);
  expect(empty.body.totalCount).toBe(0);

  // Add one payment, and the count must be exactly 1
  await request(app.getHttpServer())
    .post('/payments')
    .send({ amountKobo: 1000, customerEmail: 'e2e@example.com' })
    .expect(201);

  const after = await request(app.getHttpServer())
    .get('/payments/summary')
    .expect(200);
  expect(after.body.totalCount).toBe(1);
});


  afterEach(async () => {
    await app.close();
  });
});
