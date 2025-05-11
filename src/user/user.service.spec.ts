import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';

import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Post } from '../entities/post.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepo: jest.Mocked<Repository<User>>;
  let postRepo: jest.Mocked<Repository<Post>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Post),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));
    postRepo = module.get(getRepositoryToken(Post));
  });

  it('should create a user', async () => {
    const name = 'David';
    const email = 'david@example.com';
    const user = { id: 1, name, email, posts: [] };

    userRepo.create.mockReturnValue(user);
    userRepo.save.mockResolvedValue(user);

    const result = await service.create(name, email);
    expect(userRepo.create).toHaveBeenCalledWith({ name, email });
    expect(userRepo.save).toHaveBeenCalledWith(user);
    expect(result).toEqual(user);
  });

  it('should find all users with posts', async () => {
    const users = [{ id: 1, name: 'D', email: 'd@e.com', posts: [] }];
    userRepo.find.mockResolvedValue(users);

    const result = await service.findAllUsersWithPosts();
    expect(userRepo.find).toHaveBeenCalledWith({ relations: ['posts'] });
    expect(result).toEqual(users);
  });

  it('should find a single user with posts', async () => {
    const user = { id: 1, name: 'D', email: 'd@e.com', posts: [] };
    userRepo.findOne.mockResolvedValue(user);

    const result = await service.findUserWithPosts(1);
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['posts'],
    });
    expect(result).toEqual(user);
  });

  it('should delete a user', async () => {
    userRepo.delete.mockResolvedValue({ affected: 1, raw: {} });
    const result = await service.remove(1);
    expect(userRepo.delete).toHaveBeenCalledWith(1);
    expect(result).toMatchObject({ affected: 1 });
  });

  it('should create a post for a user', async () => {
    const user = { id: 1, name: 'D', email: 'd@e.com' } as User;
    const post = { id: 1, title: 'Hello', content: 'World', user } as Post;

    userRepo.findOneBy.mockResolvedValue(user);
    postRepo.create.mockReturnValue(post);
    postRepo.save.mockResolvedValue(post);

    const result = await service.createPostForUser(1, 'Hello', 'World');

    expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(postRepo.create).toHaveBeenCalledWith({
      title: 'Hello',
      content: 'World',
      user,
    });
    expect(postRepo.save).toHaveBeenCalledWith(post);
    expect(result).toEqual(post);
  });

  it('should throw if user not found when creating post', async () => {
    userRepo.findOneBy.mockResolvedValue(null);
    await expect(service.createPostForUser(1, 'T', 'C')).rejects.toThrow(
      'User not found',
    );
  });
});
