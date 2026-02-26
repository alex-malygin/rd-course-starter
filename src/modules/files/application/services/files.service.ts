import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  FileRecord,
  FileStatus,
} from '../../domain/entities/file-record.entity';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { CreatePresignedUrlDto } from '../../interface/dto/create-presigned-url.dto';
import { UsersService } from '@users/application/services/users.service';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileRecord)
    private readonly fileRepository: Repository<FileRecord>,
    private readonly storageService: StorageService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async createPresignedUrl(
    userId: string,
    dto: CreatePresignedUrlDto,
  ): Promise<{
    fileId: string;
    key: string;
    uploadUrl: string;
    contentType: string;
  }> {
    const fileId = uuidv4();
    const extension = dto.fileName.split('.').pop();
    const key = `users/${userId}/avatars/${fileId}.${extension}`;

    const uploadUrl = await this.storageService.getUploadPresignedUrl(
      key,
      dto.contentType,
    );

    const fileRecord = this.fileRepository.create({
      id: fileId,
      ownerId: userId,
      key,
      contentType: dto.contentType,
      status: FileStatus.PENDING,
    });

    await this.fileRepository.save(fileRecord);

    return {
      fileId,
      key,
      uploadUrl,
      contentType: dto.contentType,
    };
  }

  async completeUpload(userId: string, fileId: string): Promise<FileRecord> {
    const fileRecord = await this.fileRepository.findOne({
      where: { id: fileId },
    });

    if (!fileRecord) {
      throw new NotFoundException(`File record ${fileId} not found`);
    }

    if (fileRecord.ownerId !== userId) {
      throw new ForbiddenException(
        `Ownership check failed: file ${fileId} belongs to ${fileRecord.ownerId}, but requested by ${userId}`,
      );
    }

    if (fileRecord.status === FileStatus.READY) {
      return fileRecord;
    }

    fileRecord.status = FileStatus.READY;
    const saved = await this.fileRepository.save(fileRecord);
    console.log(`File ${fileId} marked as READY for user ${userId}`);
    return saved;
  }

  async completeAvatar(userId: string, fileId: string): Promise<FileRecord> {
    const fileRecord = await this.completeUpload(userId, fileId);
    await this.usersService.updateAvatar(userId, fileId);
    return fileRecord;
  }

  async getFileUrl(key: string): Promise<string> {
    return this.storageService.getFileUrl(key);
  }

  async findById(id: string): Promise<FileRecord | null> {
    return this.fileRepository.findOne({ where: { id } });
  }
}
