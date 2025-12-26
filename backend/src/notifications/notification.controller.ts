import { Controller, Get, Patch, Param, UseGuards, Request, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    async getNotifications(@Request() req: any) {
        return this.notificationService.getUserNotifications(req.user.userId);
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string, @Request() req: any) {
        return this.notificationService.markAsRead(id, req.user.userId);
    }

    @Patch('read-all')
    async markAllAsRead(@Request() req: any) {
        return this.notificationService.markAllAsRead(req.user.userId);
    }
}
