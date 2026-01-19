import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from '../../application/services/users.service';
import { CreateUserDTO } from '../dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDTO) {
    return this.usersService.create(createUserDto);
  }

  @Get(':email')
  async findOne(@Param('email') email: string) {
    return this.usersService.getByEmail(email);
  }
}
