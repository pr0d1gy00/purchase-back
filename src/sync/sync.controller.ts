import { Body, Controller, Get, Post, Query, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { SyncService } from './sync.service';
import { PullSyncDto } from './dto/pull-sync.dto';
import { PushSyncDto } from './dto/push-sync.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('sync')
@UseGuards(AuthGuard('jwt'))
export class SyncController {
    constructor(private readonly syncService: SyncService) { }
    @Get('pull')
    async pullChanges(@Query() query: PullSyncDto, @Request() req: any) {
        const userId = req.user.userId;
        const lastPulledAt = query.lastPulledAt || 0;
        return this.syncService.pullChanges(userId, lastPulledAt);
    }

    @Post('push')
    async pushChanges(
        @Request() req,
        @Body() pushDto: PushSyncDto
    ) {
        const userId = req.user.userId;
        return this.syncService.pushChanges(userId, pushDto);
    }
}
