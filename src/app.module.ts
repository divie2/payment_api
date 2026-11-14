import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';


ConfigModule.forRoot({ isGlobal: true })


@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
