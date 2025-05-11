import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post()
  create(@Body() body: { name: string; email: string }) {
    return this.userService.create(body.name, body.email);
  }

  @Get()
  findAll() {
    return this.userService.findAllUsersWithPosts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findUserWithPosts(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
  @Post(':userId/post')
  createPostForUser(
    @Param('userId') userId: number,
    @Body() body: { title: string; content: string },
  ) {
    return this.userService.createPostForUser(userId, body.title, body.content);
  }
}
