import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CmsService {
    constructor(private prisma: PrismaService) { }

    async getContent(sectionKey: string, language: string = 'en') {
        const content = await this.prisma.landingContent.findUnique({
            where: {
                sectionKey: sectionKey // Note: Schema defines sectionKey as unique, but language handling needs Logic
            }
        });

        if (!content) return null;

        // Simple logic: If content is found, return it.
        // Enhanced logic: If we want multi-lang per row, we'd query differently. 
        // Schema says: sectionKey is unique. Content is Json. Language is String.
        // This implies one row per sectionKey. 
        // If we want multiple languages, we should probably store them within the JSON or have a composite key.
        // Given the schema: sectionKey @unique, we can only have ONE row per section.
        // So 'language' field might be the default lang or we store all langs in 'content' JSON.
        // Let's assume content JSON has structure { en: {...}, tr: {...} } or simply just update the schema logic to handle it.

        // HOWEVER, the schema says:
        // model LandingContent {
        //   sectionKey String  @unique
        //   content   Json
        //   language  String   @default("en")
        // }
        // This design is slightly flawed for multi-row multi-lang if sectionKey is unique globally.
        // BUT, for now, let's assume valid implementation is: One row per section, content has whatever standard props.
        // If language is query param, we might just return the whole object or filter inside JSON.

        return content;
    }

    async upsertContent(sectionKey: string, content: any, language: string = 'en') {
        return this.prisma.landingContent.upsert({
            where: { sectionKey },
            update: {
                content,
                language
            },
            create: {
                sectionKey,
                content,
                language
            }
        });
    }

    async getAllContent() {
        return this.prisma.landingContent.findMany();
    }

    async getConfig(key: string) {
        return this.prisma.systemConfig.findUnique({
            where: { key }
        });
    }

    async upsertConfig(key: string, value: any, updatedBy?: string) {
        return this.prisma.systemConfig.upsert({
            where: { key },
            update: {
                value,
                updatedBy
            },
            create: {
                key,
                value,
                updatedBy
            }
        });
    }
}
