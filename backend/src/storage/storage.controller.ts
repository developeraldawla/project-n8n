import { Controller, Post, Body, Get, Param, UseGuards, Delete } from '@nestjs/common';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @Post('upload-url')
    async getUploadUrl(@Body() body: { contentType: string; folder?: string }) {
        return this.storageService.getPresignedUploadUrl(body.contentType, body.folder);
    }

    @Get('download-url/*key')
    async getDownloadUrl(@Param('key') key: string) {
        return { url: await this.storageService.getPresignedDownloadUrl(key) };
    }

    @Delete('*key')
    async deleteFile(@Param('key') key: string) {
        await this.storageService.deleteFile(key);
        return { success: true };
    }
}
