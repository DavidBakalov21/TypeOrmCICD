import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  create(name: string, email: string) {
    const user = this.userRepo.create({ name, email });
    return this.userRepo.save(user);
  }

  findAllUsersWithPosts() {
    return this.userRepo.find({
      relations: ['posts'],
    });
  }

  findUserWithPosts(id: number) {
    return this.userRepo.findOne({
      where: { id },
      relations: ['posts'],
    });
  }

  remove(id: number) {
    return this.userRepo.delete(id);
  }
  async createPostForUser(userId: number, title: string, content: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    const post = this.postRepo.create({ title, content, user });
    return this.postRepo.save(post);
  }
}
