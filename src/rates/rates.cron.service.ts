import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RatesCronService {
    private readonly logger = new Logger(RatesCronService.name);

    constructor(private readonly prisma: PrismaService) { }

    // Para producción usarías: @Cron(CronExpression.EVERY_DAY_AT_9AM)
    // Pero para probar ahora mismo, lo corremos cada 10 segundos:
    @Cron(CronExpression.EVERY_10_SECONDS)
    async fetchAndSaveRates() {
        this.logger.log('Buscando nuevas tasas de cambio (BCV y Paralelo)...');

        // Simulamos el consumo de una API externa
        const simulatedBcv = 45.20 + (Math.random() * 0.5);
        const simulatedParalelo = 53.10 + (Math.random() * 1.5);

        // Guardamos la tasa en la base de datos (con userId: null para que sea Global)
        await this.prisma.exchangeRate.createMany({
            data: [
                {
                    baseCurrency: 'USD',
                    targetCurrency: 'VES',
                    source: 'BCV',
                    rate: simulatedBcv,
                    userId: null
                },
                {
                    baseCurrency: 'USD',
                    targetCurrency: 'VES',
                    source: 'PARALELO',
                    rate: simulatedParalelo,
                    userId: null
                }
            ]
        });

        this.logger.log(`¡Nuevas tasas publicadas! BCV: ${simulatedBcv.toFixed(2)} | PARAL: ${simulatedParalelo.toFixed(2)}`);
    }
}
