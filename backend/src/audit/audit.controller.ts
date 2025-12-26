import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AuditController {
    constructor(private auditService: AuditService) { }

    // @UseGuards(JwtAuthGuard) // Toggle on when ready
    @Get()
    async getLogs() {
        return this.auditService.findAll();
    }
}
