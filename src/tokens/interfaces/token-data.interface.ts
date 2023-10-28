import { ObjectId } from "mongoose";

export interface tokenData {
    _id?: ObjectId;
    userId: string;
    tokenId: string;
}