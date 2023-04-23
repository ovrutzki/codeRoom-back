import express from "express";
import { connectToDB } from "./connection";
import routes from "./routes/index";
import bodyParser from "body-parser";
import cors from "cors";
import { getAllRooms } from "./controller/room.controller";
import { getRooms } from "./service/room.service";
import { IRoom } from "./models/room.model";
import { socketConnection } from "./Socket/Socket";

const app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cors());

app.use(routes);
export const server = app.listen(8000, () => console.log("Listening..."));

connectToDB();

socketConnection()



// usersInRoom.map((room:IRooms) => {
//     if(room.roomTopic === topic){
//         room.amountOfUsers ++
//         console.log("join",usersInRoom);
//     }})
//     socket.on('disconnect', () => {
//         socket.leave(topic)
//         usersInRoom.map((room:IRooms) => {
//             if(room.roomTopic === topic){
//                 room.amountOfUsers --
//                 console.log('disconnect',usersInRoom);
//             }})
//   });
