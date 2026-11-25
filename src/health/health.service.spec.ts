import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { HealthService } from './health.service.js';
import { PG_POOL } from '../database/database.module.js';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        // When HealthService asks for PG_POOL, hand it this fake instead of a real pool
        { provide: PG_POOL, useValue: { query: vi.fn() } },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
