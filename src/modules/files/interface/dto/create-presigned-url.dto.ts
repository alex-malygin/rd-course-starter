import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePresignedUrlDto {
  @IsNotEmpty()
  @IsString()
  contentType: string;

  @IsNotEmpty()
  @IsString()
  fileName: string;
}
