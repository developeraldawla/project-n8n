import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(private prisma: PrismaService) { }

    async createInAppNotification(userId: string, type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS', message: string) {
        return this.prisma.notification.create({
            data: {
                userId,
                type,
                message,
            },
        });
    }

    async getUserNotifications(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async markAsRead(id: string, userId: string) {
        // Ensure user owns notification
        return this.prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }

    async sendEmail(to: string, subject: string, content: string) {
        // TODO: Integrate SendGrid or Resend
        this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Content: ${content}`);
        return true;
    }
}
