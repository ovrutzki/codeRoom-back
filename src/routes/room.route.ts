import express, { Request, Response } from "express";
import { getAllRooms } from "../controller/room.controller";

const roomRouter = express.Router();

roomRouter.get('/',getAllRooms);


export default roomRouter;