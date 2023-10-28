import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Token } from './entities/token.entity';
import { Model } from 'mongoose';
import { tokenData } from './interfaces/token-data.interface';

@Injectable()
export class TokensService {

  constructor(
    @InjectModel(Token.name)
    private readonly tokenModel: Model<Token>
    ) {
  }

  async create(userId: string, tokenId: string) {
    
    try {
      const token: CreateTokenDto = {userId, tokenId};
      
      return await this.tokenModel.create(token);
    } catch (error) {
      if (error['code'] === 11000) {
        await this.remove(userId);
        this.create(userId, tokenId);
      } else {
        this.handleExceptions(error);
      }
    };
  }

  findAll() {
    return `This action returns all tokens`;
  }

  async findOne(userId: string): Promise<tokenData> {
    const token = this.tokenModel.findOne({
      userId: userId
    });
    if (!token) {
      throw new NotFoundException(`Token with the Userid:  "${ userId }" not found`);
    }
    return token;
  }

  update(id: number, updateTokenDto: UpdateTokenDto) {
    return `This action updates a #${id} token`;
  }

  async remove(userId: string) {
    await this.tokenModel.deleteOne({ userId: userId });
    return;
  }

  private handleExceptions( error: any ) {
    if (error.code === 11000) {
      throw new BadRequestException(`Token exists in db ${JSON.stringify(error.keyValue)}`)
    }
    throw new InternalServerErrorException(`Can't update token - check server logs`);  
  }
}
