import { IsNotEmpty, IsUUID } from 'class-validator';

export class CompleteUploadDto {
  @IsNotEmpty()
  @IsUUID()
  fileId: string;
}
