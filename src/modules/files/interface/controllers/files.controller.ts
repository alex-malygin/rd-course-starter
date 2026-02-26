import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { FilesService } from '../../application/services/files.service';
import { CreatePresignedUrlDto } from '../dto/create-presigned-url.dto';
import { CompleteUploadDto } from '../dto/complete-upload.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('presign')
  async createPresignedUrl(
    @Body() dto: CreatePresignedUrlDto,
    @Request() req: any,
  ) {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      throw new Error('x-user-id header is required for testing');
    }
    return this.filesService.createPresignedUrl(userId, dto);
  }

  @Post('complete')
  async completeUpload(@Body() dto: CompleteUploadDto, @Request() req: any) {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      throw new Error('x-user-id header is required for testing');
    }
    return this.filesService.completeUpload(userId, dto.fileId);
  }

  @Post('complete-avatar')
  async completeAvatar(@Body() dto: CompleteUploadDto, @Request() req: any) {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      throw new Error('x-user-id header is required for testing');
    }
    return this.filesService.completeAvatar(userId, dto.fileId);
  }
}
