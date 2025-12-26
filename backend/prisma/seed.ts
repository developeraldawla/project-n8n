import { PrismaClient, ToolStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create Plans
    const freePlan = await prisma.plan.upsert({
        where: { slug: 'free' },
        update: {},
        create: {
            name: 'Free Tier',
            slug: 'free',
            priceMonthly: 0,
            features: { bulk_export: false, api_access: false },
            limits: { tools_daily: 5, storage_gb: 1 },
            isActive: true
        }
    });
    console.log('Plan created: Free');

    const proPlan = await prisma.plan.upsert({
        where: { slug: 'pro' },
        update: {},
        create: {
            name: 'Pro Tier',
            slug: 'pro',
            priceMonthly: 29.99,
            features: { bulk_export: true, api_access: true },
            limits: { tools_daily: 1000, storage_gb: 50 },
            isActive: true
        }
    });
    console.log('Plan created: Pro');

    // 2. Create Demo Tool (SEO Generator)
    const seoTool = await prisma.tool.upsert({
        where: { slug: 'seo-generator' },
        update: {},
        create: {
            name: 'SEO Meta Generator',
            slug: 'seo-generator',
            category: 'marketing',
            description: { en: "Generate SEO-optimized titles and descriptions for your blog posts." },
            status: ToolStatus.ACTIVE,
            currentVersion: 1
        }
    });
    console.log('Tool created: SEO Generator');

    // 3. Create Tool Version
    const v1 = await prisma.toolVersion.upsert({
        where: {
            toolId_versionNumber: { toolId: seoTool.id, versionNumber: 1 }
        },
        update: {},
        create: {
            toolId: seoTool.id,
            versionNumber: 1,
            isPublished: true,
            webhookUrl: 'https://n8n.webhook.site/test-hook', // Dummy Hook
            inputSchema: {
                type: "object",
                properties: {
                    topic: { type: "string", title: "Blog Topic" },
                    keywords: { type: "string", title: "Keywords" },
                    tone: { type: "string", title: "Tone", enum: ["Professional", "Casual", "Urgent"] }
                },
                required: ["topic"]
            },
            outputSchema: {}
        }
    });
    console.log('Tool Version v1 created');

    // 4. Link Tool to Free Plan
    await prisma.toolAccess.upsert({
        where: { toolId_planId: { toolId: seoTool.id, planId: freePlan.id } },
        update: {},
        create: {
            toolId: seoTool.id,
            planId: freePlan.id,
            isHidden: false
        }
    });
    console.log('Access granted to Free Plan');

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
