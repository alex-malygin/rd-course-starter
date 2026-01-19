import { Module } from '@nestjs/common';
import { UsersService } from './application/services/users.service';
import { UsersController } from './interface/controllers/users.controller';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { InMemoryUserRepository } from './infrastructure/persistence/in-memory-user.repository';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USER_REPOSITORY,
      useClass: InMemoryUserRepository,
    },
  ],
})
export class UsersModule {}
