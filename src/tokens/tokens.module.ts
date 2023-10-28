import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from './entities/token.entity';

@Module({
  controllers: [TokensController],
  providers: [TokensService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Token.name,
        schema: TokenSchema
      }
    ])
  ],
  exports: [
    TokensService
  ]
})
export class TokensModule {}
