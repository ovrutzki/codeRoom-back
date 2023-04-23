import { Request, Response } from "express";
import { getRooms, codeSaving } from "../service/room.service";

export const getAllRooms = async (req: Request, res: Response)=>{
    try {
        const rooms = await getRooms()
        return res.status(200).json(rooms);
    } catch (error) {
     console.log(error);
        
    }
}

export const saveCode = async (req: Request, res: Response)=>{
    const {roomCode, roomName} = req.body
    console.log(roomCode, roomName);
    
    try {
        const rooms = await codeSaving(roomCode,roomName)
        return res.status(200).json(rooms);
    } catch (error) {
     console.log(error);
        
    }
}