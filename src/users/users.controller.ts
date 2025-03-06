import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Logger,
  Res,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';

@Controller('users')
export class UsersController {
  logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get('user-info')
  @Render('user-info')
  async findDetail(@Res() res: Response, @Req() request: Request) {
    const idUser = request.cookies['user_id'] as string;
    if (idUser) {
      const user = await this.usersService.findOne(idUser);
      if (user?.username) {
        return { user };
      } else {
        return res.redirect('/login');
      }
    } else {
      return res.redirect('/login');
    }
  }

  @Get('edit')
  @Render('user-edit')
  async getDetail(@Res() res: Response, @Req() request: Request) {
    const idUser = request.cookies['user_id'] as string;
    if (idUser) {
      const user = await this.usersService.findOne(idUser);
      if (user?.username) {
        return { user };
      } else {
        return res.redirect('/login');
      }
    } else {
      return res.redirect('/login');
    }
  }

  @Post('edit')
  async updateDetail(
    @Res() res: Response,
    @Req() request: Request,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const idUser = request.cookies['user_id'] as string;
    if (idUser) {
      const user = await this.usersService.update(idUser, updateUserDto);

      if (user?._id) {
        return res.redirect('user-info');
      } else {
        return res.redirect('/login');
      }
    } else {
      return res.redirect('/login');
    }
  }
}
