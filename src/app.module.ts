import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';


import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';


import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { IamModule } from './iam/iam.module';
import { TokensModule } from './tokens/tokens.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        MONGO_DB_USER: Joi.required(),
        MONGO_DB_PASS: Joi.required(),
        MONGO_DB_NAME: Joi.required(),
        PORT: Joi.number().default(3000),
        JWT_SECRET: Joi.required(),
        JWT_TOKEN_AUDIENCE: Joi.required(),
        JWT_TOKEN_ISSUER: Joi.required(),
        JWT_ACCESS_TOKEN_TTL: Joi.required(),
        JWT_REFRESH_TOKEN_TTL: Joi.required(),
      }),
    }),
    MongooseModule.forRoot(`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASS}@cluster0.my5x4.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`),
    UsersModule,
    IamModule,
    TokensModule,

    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    //   plugins: [ApolloServerPluginLandingPageLocalDefault()],
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
