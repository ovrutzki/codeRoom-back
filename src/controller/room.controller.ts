import { Request, Response } from "express";
import { getRooms } from "../service/room.service";

export const getAllRooms = async (req: Request, res: Response)=>{
    try {
        const rooms = await getRooms()
        return res.status(200).json(rooms);
    } catch (error) {
     console.log(error);
        
    }
}