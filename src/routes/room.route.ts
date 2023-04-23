import express, { Request, Response } from "express";
import { getAllRooms, saveCode } from "../controller/room.controller";

const roomRouter = express.Router();

roomRouter.get('/',getAllRooms);

roomRouter.post('/saveCode',saveCode);


export default roomRouter;