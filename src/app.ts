import express from "express";
import { connectToDB } from "./connection";
import routes from "./routes/index";
import bodyParser from "body-parser";
import cors from "cors";
import { getAllRooms } from "./controller/room.controller";
import { getRooms } from "./service/room.service";
import { IRoom } from "./models/room.model";
import { Server } from "socket.io";

const app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cors());

app.use(routes);
const server = app.listen(8000, () => console.log("Listening..."));

connectToDB();

interface IRoomsDetails {
  roomTopic: string;
  amountOfUsers: number;
  mentorId?: string;
  roomCode?: string[];
}
let rooms:IRoomsDetails[] = [];

const getRoomFromDb = async () => {
    const roomsFromDb: IRoom[] = await getRooms();
   roomsFromDb.map((room: IRoom) => {
    const oneRoom:IRoomsDetails = {
        roomTopic: room.roomName,
        amountOfUsers: 0,
        mentorId: "",
        roomCode: room.value,
      }
      rooms.push(oneRoom)
   }
       );
 
};

getRoomFromDb();

const io = new Server(server,{
    cors: {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"],
    },
  }) ;

io.on("connection", (socket: any) => {
    console.log("id", socket.id);
    
    socket.on("specific-room", (topic: string) => {
      const room = rooms.find((e:IRoomsDetails) => e.roomTopic === topic);
      socket.join(topic);
      if(room){
            socket.emit("send-code", room.roomCode);
            socket.emit("mentor-id", room.mentorId);
            room.amountOfUsers = room.amountOfUsers + 1;
            if (room.amountOfUsers === 1) {
              room.mentorId = socket.id;
            }
        }
    console.log('room',room);
  });

  socket.on("user-typing", (code: string, topic: string) => {
    const room = rooms.find((e:IRoomsDetails) => e.roomTopic === topic);
    if(room){
        room.roomCode = code.split('\n')
        socket.to(topic).emit("send-code", room.roomCode);
    }

});

socket.on('disconnect',()=>{
    const room = rooms.find((r) => r.roomTopic === socket.handshake.query.roomTopic);
    if(room && room.amountOfUsers > 0){
        room.amountOfUsers = room.amountOfUsers - 1;
    }
    console.log('disconnect',room);
    
})
  
});

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
