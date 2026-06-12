import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('exchange-rates')
export class ExchangeRatesController {
    constructor(private readonly prisma: PrismaService) {}

    @Get()
    async getLatestRate(
        @Query('base') baseCurrency: string = 'USD',
        @Query('target') targetCurrency: string = 'VES',
        @Query('source') source?: string,
    ) {
        const where: any = {
            baseCurrency,
            targetCurrency,
            deletedAt: null,
        };
        
        if (source) {
            where.source = source.toUpperCase();
        }

        const rate = await this.prisma.exchangeRate.findFirst({
            where,
            orderBy: { date: 'desc' },
        });

        if (!rate) {
            return { rate: null, error: 'No rate found' };
        }

        return {
            rate: rate.rate.toString(),
            source: rate.source,
            date: rate.date.toISOString(),
            baseCurrency: rate.baseCurrency,
            targetCurrency: rate.targetCurrency,
        };
    }

    @Get('history')
    async getRateHistory(
        @Query('base') baseCurrency: string = 'USD',
        @Query('target') targetCurrency: string = 'VES',
        @Query('days') daysStr?: string,
    ) {
        const days = daysStr ? parseInt(daysStr, 10) : 7;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        const rates = await this.prisma.exchangeRate.findMany({
            where: {
                baseCurrency,
                targetCurrency,
                deletedAt: null,
                date: { gte: cutoff },
            },
            orderBy: { date: 'desc' },
        });

        return { rates };
    }
}