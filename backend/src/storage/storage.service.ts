import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
    private s3Client: S3Client;
    private bucketName: string;

    constructor() {
        // Support both AWS_ and S3_ environment variable naming used in compose
        this.bucketName = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET || 'alhosni-saas-uploads';
        const region = process.env.AWS_REGION || process.env.S3_REGION || 'us-east-1';

        const endpoint = process.env.AWS_ENDPOINT || process.env.S3_ENDPOINT || undefined;
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY || 'minioadmin';
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY || 'minioadmin';

        this.s3Client = new S3Client({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
            endpoint, // Optional for MinIO/LocalStack
            forcePathStyle: !!endpoint,
        });
    }

    async getPresignedUploadUrl(contentType: string, folder = 'uploads'): Promise<{ key: string; url: string }> {
        const key = `${folder}/${uuidv4()}`;
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: contentType,
        });

        try {
            const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
            return { key, url };
        } catch (error) {
            throw new InternalServerErrorException('Failed to generate upload URL');
        }
    }

    async getPresignedDownloadUrl(key: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        try {
            return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
        } catch (error) {
            throw new InternalServerErrorException('Failed to generate download URL');
        }
    }

    async deleteFile(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        try {
            await this.s3Client.send(command);
        } catch (error) {
            throw new InternalServerErrorException('Failed to delete file');
        }
    }

    async uploadBuffer(buffer: Buffer, mimeType: string, extension: string, folder = 'n8n_outputs'): Promise<{ key: string; url: string }> {
        const key = `${folder}/${uuidv4()}.${extension}`;
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
        });

        try {
            await this.s3Client.send(command);
            // Return a download URL immediately? Or just key?
            // Let's return the key and a short-lived signed URL for immediate display
            const url = await this.getPresignedDownloadUrl(key);
            return { key, url };
        } catch (error) {
            console.error('S3 Upload Error:', error);
            throw new InternalServerErrorException('Failed to upload file buffer');
        }
    }
}
