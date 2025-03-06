import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const createdUser = await this.UserModel.create(createUserDto);
    return createdUser;
  }

  async findAll() {
    return this.UserModel.find({});
  }

  async findOne(id: string) {
    const user = await this.UserModel.findById(id);
    return user;
  }

  async findByUserName(username: string) {
    return this.UserModel.findOne({ username: username });
  }

  async login(username: string, password: string) {
    const user = await this.findByUserName(username);
    if (!user) throw new NotFoundException({ message: 'User Not Found!' });

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword)
      throw new ForbiddenException({ message: 'User Password Wrong!' });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.UserModel.findByIdAndUpdate(
      id,
      updateUserDto,
    );
    return updatedUser;
  }

  async remove(id: string) {
    return this.UserModel.findByIdAndDelete({ _id: id });
  }
}
