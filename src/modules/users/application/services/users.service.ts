import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDTO } from '../../interface/dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async create(user: CreateUserDTO): Promise<User> {
    const { email, name } = user;
    const existing = await this.userRepository.findByEmail(email);

    if (existing) {
      throw new ConflictException('Uset already exist');
    }

    const newUser = new User(Math.random().toString(), email, name);
    return this.userRepository.save(newUser);
  }

  async getByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }
}
