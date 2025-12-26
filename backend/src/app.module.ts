import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ToolsModule } from './tools/tools.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { UsageModule } from './usage/usage.module';
import { AuditModule } from './audit/audit.module';
import { CmsModule } from './cms/cms.module';
import { StorageModule } from './storage/storage.module';
import { NotificationModule } from './notifications/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ToolsModule,
    SubscriptionModule,
    UsageModule,
    AuditModule,
    CmsModule,
    StorageModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
