import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeatureFlagService {
    constructor(private prisma: PrismaService) { }

    async isEnabled(userId: string, featureKey: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { plan: true }
        });

        if (!user || !user.plan) return false;

        const features = user.plan.features as any;
        if (!features) return false;

        // Support exact match "bulk_export": true or nested?
        // Assuming simple key-value for now.
        return !!features[featureKey];
    }

    async getLimit(userId: string, limitKey: string): Promise<number> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { plan: true }
        });

        if (!user || !user.plan) return 0;

        const limits = user.plan.limits as any;
        return limits?.[limitKey] || 0;
    }
}
