import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService Registration Flow', () => {
    let authService: AuthService;
    let prismaService: PrismaService;

    const mockPlan = { id: 'plan-free-id', slug: 'free' };
    const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'USER',
        planId: 'plan-free-id',
        subscription: { status: 'ACTIVE' }
    };

    const mockPrismaService = {
        plan: {
            findUnique: jest.fn().mockResolvedValue(mockPlan),
        },
        user: {
            create: jest.fn().mockResolvedValue(mockUser),
            findUnique: jest.fn(),
        },
    };

    const mockJwtService = {
        signAsync: jest.fn().mockResolvedValue('test-token'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should assign Free Plan and create Active Subscription on register', async () => {
        const registerDto = { email: 'test@example.com', password: 'password123' };

        await authService.register(registerDto);

        // Verify it fetched the free plan
        expect(prismaService.plan.findUnique).toHaveBeenCalledWith({ where: { slug: 'free' } });

        // Verify user creation includes planId and subscription
        expect(prismaService.user.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                email: 'test@example.com',
                planId: 'plan-free-id',
                subscription: expect.objectContaining({
                    create: expect.objectContaining({
                        status: 'ACTIVE'
                    })
                })
            })
        }));
    });
});
