import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDTO } from '../../interface/dto/create-user.dto';
import { FilesService } from 'src/modules/files/application/services/files.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(forwardRef(() => FilesService))
    private readonly filesService: FilesService,
  ) {}

  async create(user: CreateUserDTO): Promise<User> {
    const { email } = user;
    const existing = await this.userRepository.findByEmail(email);

    if (existing) {
      throw new ConflictException('User already exist');
    }

    const newUser = new User();
    Object.assign(newUser, user);
    return this.userRepository.save(newUser);
  }

  async getByEmail(email: string): Promise<any> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    let avatarUrl: string | null = null;
    if (user.avatarFileId) {
      const fileRecord = await this.filesService.findById(user.avatarFileId);
      if (fileRecord) {
        avatarUrl = await this.filesService.getFileUrl(fileRecord.key);
      }
    }

    return {
      ...user,
      avatarUrl,
    };
  }

  async updateAvatar(userId: string, avatarFileId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.avatarFileId = avatarFileId;
    return this.userRepository.save(user);
  }
}
