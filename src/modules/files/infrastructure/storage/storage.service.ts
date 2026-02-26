import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly cloudfrontBaseUrl: string | undefined;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.getOrThrow<string>('aws.region');
    const accessKeyId =
      this.configService.getOrThrow<string>('aws.accessKeyId');
    const secretAccessKey = this.configService.getOrThrow<string>(
      'aws.secretAccessKey',
    );

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.bucket = this.configService.getOrThrow<string>('aws.bucket');
    this.cloudfrontBaseUrl = this.configService.get<string>(
      'aws.cloudfrontBaseUrl',
    );
  }

  async getUploadPresignedUrl(
    key: string,
    contentType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async getFileUrl(key: string): Promise<string> {
    if (this.cloudfrontBaseUrl) {
      return `${this.cloudfrontBaseUrl}/${key}`;
    }

    const region = this.configService.getOrThrow<string>('aws.region');
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}
