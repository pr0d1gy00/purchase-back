import { Module } from '@nestjs/common';
import { RatesCronService } from './rates.cron.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [RatesCronService]
})
export class RatesModule { }
