import { Module } from '@nestjs/common';
import { RatesCronService } from './rates.cron.service';
import { ExchangeRatesController } from './exchange-rates.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ExchangeRatesController],
    providers: [RatesCronService],
    exports: [RatesCronService],
})
export class RatesModule { }
