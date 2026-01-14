import { Module } from '@nestjs/common';
import { UsersService } from './application/services/users.service';
import { UsersController } from './interface/controllers/users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
