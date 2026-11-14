import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const PG_POOL = 'PG_POOL';                 // the name tag

@Global()                                         // every module may use it
@Module({
  providers: [
    {
      provide: PG_POOL,                           // "when someone asks for PG_POOL..."
      inject: [ConfigService],                    // "...first give me the config..."
      useFactory: (config: ConfigService) =>      // "...then build it with this recipe"
        new Pool({ connectionString: config.getOrThrow<string>('DATABASE_URL') }),
    },
  ],
  exports: [PG_POOL],                             // let other modules ask for it
})
export class DatabaseModule {}
