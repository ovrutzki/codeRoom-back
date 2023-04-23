import { RoomModel } from "../models/room.model";

export const getRooms = async () => {
    try {
      const rooms = await RoomModel.find();      
      return rooms;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

export const codeSaving = async (roomCode:string[],roomName:string) => {
    try {
      const rooms = await RoomModel.findOneAndUpdate({roomName:roomName}, {$set:{value:roomCode}});      
      return rooms;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };