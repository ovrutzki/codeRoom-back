import express from "express";
import roomRouter from "./room.route";

const router = express.Router();

router.use("/api/room/", roomRouter);


export default router;

  