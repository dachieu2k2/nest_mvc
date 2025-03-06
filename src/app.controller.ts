import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { Response, Request } from 'express';

@Controller()
export class AppController {
  logger = new Logger(AppController.name);
  constructor(
    private readonly appService: AppService,
    private readonly userService: UsersService,
  ) {}

  @Get('login')
  @Render('login')
  loginView() {
    return { message: 'Hello world!' };
  }

  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie('user_id');
    return res.redirect('/login');
  }
  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() body: CreateUserDto,
  ) {
    const user = await this.userService.login(body.username, body.password);

    if (user) {
      res.cookie('user_id', user._id);
    }
    return res.redirect('/users/user-info');
  }

  @Get('register')
  @Render('register')
  registerView() {
    return { message: 'Hello world!' };
  }

  @Post('register')
  async registerCreate(@Res() res: Response, @Body() body: CreateUserDto) {
    this.logger.debug(
      'name ' +
        body.name +
        'nickname ' +
        body.nickname +
        'age ' +
        body.age +
        'email ' +
        body.email +
        'username ' +
        body.username +
        'password ' +
        body.password,
    );

    const saltOrRounds = 10;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashPassword = bcrypt.hashSync(body.password, saltOrRounds);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dataUser = { ...body, password: hashPassword };

    const user = await this.userService.create(dataUser);
    if (user) {
      res.cookie('user_id', user?._id);
      return res.redirect('/users/user-info');
    }

    return res.redirect('/login');
  }

  @Get()
  @Render('index')
  async root(@Res() res: Response, @Req() request: Request) {
    const idUser = request.cookies['user_id'] as string;
    if (idUser) {
      const user = await this.userService.findOne(idUser);
      if (user?.username) {
        return { user, message: 'Hello world' };
      } else {
        return res.redirect('/login');
      }
    } else {
      return res.redirect('/login');
    }
  }

  // @Get('*')
  // notFound(@Res() res: Response) {
  //   // console.log('run here?');

  //   // if (res.statusCode === 500) {
  //   //   res.clearCookie('user_id');
  //   //   return res.redirect('/login');
  //   // }
  //   return res.status(400).render('404', { title: 'Page Not Found' });
  // }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
