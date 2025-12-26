import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async findAll(limit: number = 50) {
        return this.prisma.auditLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                admin: {
                    select: {
                        email: true,
                        role: true
                    }
                }
            }
        });
    }

    async createLog(adminId: string, action: string, targetEntity: string, details?: any) {
        return this.prisma.auditLog.create({
            data: {
                adminId,
                action,
                targetEntity,
                details
            }
        });
    }
}
