import { Schema, model } from "mongoose";
import mongoose from "mongoose";

export interface IRoom {
    roomName:string,
    language:string,
    users:number,
    value:string
}

export const roomSchema = new Schema<IRoom>({
    roomName:{ type: String },
    language:{ type: String },
    users:{ type: Number },
    value:{ type: String }
});

export const RoomModel = mongoose.model<IRoom>(
  "room",
  roomSchema
);