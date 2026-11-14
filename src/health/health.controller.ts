import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service.js';


@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService) { }

    @Get()
    async check() {
        try {
            await this.healthService.check()
            return { status: "ok", database: "up" };
        } catch {
            throw new ServiceUnavailableException({ status: 'error', database: 'down' });
        }
    }
}

