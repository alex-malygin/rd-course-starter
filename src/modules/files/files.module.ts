import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileRecord } from './domain/entities/file-record.entity';
import { FilesService } from './application/services/files.service';
import { FilesController } from './interface/controllers/files.controller';
import { StorageService } from './infrastructure/storage/storage.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileRecord]),
    forwardRef(() => UsersModule),
  ],
  controllers: [FilesController],
  providers: [FilesService, StorageService],
  exports: [FilesService],
})
export class FilesModule {}
