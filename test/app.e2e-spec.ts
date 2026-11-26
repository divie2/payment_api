import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { setupApp } from '../src/setup-app.js';

describe('Payments API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    setupApp(app)

    await app.init();

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

  afterEach(async () => {
    await app.close();
  });
});
