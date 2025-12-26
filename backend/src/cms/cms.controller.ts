import { Controller, Get, Post, Body, Param, Query, UseGuards, Put } from '@nestjs/common';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('cms')
export class CmsController {
    constructor(private cmsService: CmsService) { }

    @Get('public')
    async getPublicContent(@Query('section') section?: string) {
        if (section) {
            return this.cmsService.getContent(section);
        }
        return this.cmsService.getAllContent();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Put('content/:key')
    async updateContent(
        @Param('key') key: string,
        @Body() body: { content: any; language?: string }
    ) {
        return this.cmsService.upsertContent(key, body.content, body.language);
    }

    @Get('config/:key')
    async getConfig(@Param('key') key: string) {
        return this.cmsService.getConfig(key);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Put('config/:key')
    async updateConfig(
        @Param('key') key: string,
        @Body() body: { value: any },
        // @User() user // Assuming we have a user decorator to get ID
    ) {
        // Mock admin ID for now or extract from request if User decorator exists
        return this.cmsService.upsertConfig(key, body.value, 'ADMIN');
    }
}
