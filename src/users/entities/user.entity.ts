import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Role } from "../enums/role.enum";

@Schema()
export class User extends Document {
    @Prop({
        unique: true,
        index: true
    })
    email: string;

    @Prop()
    password: string;

    @Prop({
        default: Role.Regular
    })
    roles:Role[];
}

export const UserSchema = SchemaFactory.createForClass(User);
