import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './application/services/users.service';
import { UsersController } from './interface/controllers/users.controller';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { TypeORMUserRepository } from './infrastructure/persistence/typeorm-user.repository';
import { User } from './domain/entities/user.entity';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => FilesModule)],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USER_REPOSITORY,
      useClass: TypeORMUserRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
