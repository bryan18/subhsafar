import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { User } from './entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';



@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>
  ){}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = new this.userModel( createUserDto );
      const date = new Date().getTime();
      user.createdAt = date;
      user.updatedAt = date;      
      return user.save();
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    return this.userModel.find().exec();
  }

  async findOne(id: string) {

    const user = await this.userModel.findOne({ _id: id }).exec();

    if (!user) {
      throw new NotFoundException(`User with the id:  "${ id }" not found`);
    }
    
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.userModel.findOne({
      email: email.trim()
    });

    if (!user) {
      throw new NotFoundException(`User with the email:  "${ email }" not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const date = new Date().getTime();
    updateUserDto.updatedAt = date;
    const existingUser = await this.userModel
      .findOneAndUpdate(
        { _id: id },
        { $set: updateUserDto },
        { new: true }
      )
      .exec();

    if (!existingUser) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return existingUser;
  }

  // async remove(id: string) {
  //   const user = await this.findOne(id);
  //   return user.remove({
  //     id: id
  //   });
  // }

  private handleExceptions( error: any ) {
    if (error.code === 11000) {
      throw new BadRequestException(`User exists in db ${JSON.stringify(error.keyValue)}`)
    }
    throw new InternalServerErrorException(`Can't update User - check server logs`);  
  }
}
