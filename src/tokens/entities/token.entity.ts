import { Document } from "mongoose";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Token extends Document {
    
    @Prop(
        { unique: true,
          index: true
    })
    userId: string;

    @Prop({
        unique: true
    })
    tokenId: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);

