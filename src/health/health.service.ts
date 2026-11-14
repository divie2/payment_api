import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module.js';



@Injectable()
export class HealthService {
    constructor(@Inject(PG_POOL) private readonly pool: Pool) { }

    async check() {

        await this.pool.query("SELECT 1");

    }


}