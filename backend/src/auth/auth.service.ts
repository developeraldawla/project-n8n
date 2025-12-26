import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const hash = await bcrypt.hash(dto.password, 10);

        // 1. Fetch Free Plan
        const freePlan = await this.prisma.plan.findUnique({ where: { slug: 'free' } });

        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    passwordHash: hash,
                    role: 'USER',
                    // 2. Assign Free Plan
                    planId: freePlan?.id,
                    // 3. Create Active Subscription for Free Tier
                    subscription: freePlan ? {
                        create: {
                            status: 'ACTIVE',
                            currentPeriodStart: new Date(),
                            currentPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 10)) // Indefinite for free
                        }
                    } : undefined
                },
                include: { plan: true, subscription: true }
            });
            return this.signToken(user.id, user.email, user.role);
        } catch (error) {
            if (error.code === 'P2002') {
                throw new UnauthorizedException('Email already exists');
            }
            throw error;
        }
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const pwMatches = await bcrypt.compare(dto.password, user.passwordHash);
        if (!pwMatches) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.signToken(user.id, user.email, user.role);
    }

    async signToken(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };
        const token = await this.jwtService.signAsync(payload, {
            expiresIn: '1d', // Standard SaaS expiry
            secret: process.env.JWT_SECRET,
        });
        return {
            access_token: token,
            accessToken: token,
            user_id: userId,
            role: role
        };
    }
}
