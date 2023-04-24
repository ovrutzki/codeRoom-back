import { server } from "../app";
import { IRoom } from "../models/room.model";
import { getRooms } from "../service/room.service";
import { Server } from "socket.io";

interface IRoomsDetails {
  roomTopic: string;
  amountOfUsers: number;
  mentorId?: string;
  roomCode?: string[];
  clientConnect: string[];
}

export const socketConnection = () => {
  let rooms: IRoomsDetails[] = [];

  const getRoomFromDb = async () => {
    const roomsFromDb: IRoom[] = await getRooms();
    roomsFromDb.map((room: IRoom) => {
      const oneRoom: IRoomsDetails = {
        roomTopic: room.roomName,
        amountOfUsers: 0,
        mentorId: "",
        roomCode: room.value,
        clientConnect: [],
      };
      rooms.push(oneRoom);
    });
  };

  getRoomFromDb();

  const io = new Server(server, {
    cors: {
      origin: ['https://eran-coderoom.onrender.com'],
      methods: ["GET", "POST"],
    },
  });
  

  io.on("connection", (socket: any) => {
    const room = rooms.find(
      (r) => r.roomTopic === socket.handshake.query.roomTopic
    );
    const ip = socket.handshake.headers['x-forwarded-for'].split(',')[0];

    if((room?.clientConnect.findIndex((e) =>e===ip)) === -1)
    room?.clientConnect.push(ip);
    console.log("clients",room?.clientConnect);
    
    // send the ip address to the client:
    socket.emit("ip-address", ip);

    socket.on("specific-room", (topic: string) => {
      socket.join(topic);
      if (room) {
        if (room.clientConnect[0] === ip) {
          room.mentorId = ip;
          console.log(ip, "cc", room.mentorId);
          
        }
        socket.emit("send-code", room.roomCode);
        socket.emit("mentor-id", room.mentorId);
        room.amountOfUsers = room.amountOfUsers + 1;
        console.log("++1", room.roomTopic, room.amountOfUsers);
      }
    });

    socket.on("not-mentor", () => {
      if (room) {
        room.mentorId = "";
        room.amountOfUsers = 0;
        const clientId = room.clientConnect.shift()
        clientId && room.clientConnect.push(clientId)
      }
    });
    socket.on('is-mentor', ()=>{
        if(room){
            const ipIndex = room.clientConnect.findIndex((e)=> e===ip);
            const clientId = room.clientConnect.splice(ipIndex,1)[0];
            room.clientConnect.unshift(clientId)
        }
        socket.to(room?.roomTopic).emit('not-mentor')
    })


    socket.on("user-typing", (code: string[], topic: string) => {
      if (room) {
        room.roomCode = code;
        socket.broadcast.to(topic).emit("send-code", code);
      }
    });

    socket.on("disconnect", () => {
      if(room){
        const ipIndex = room.clientConnect.findIndex((e)=> e===ip)
        console.log("disconnect" , room.clientConnect[ipIndex]);
        
        delete room.clientConnect[ipIndex]
      }
    //   if (room && room.amountOfUsers > 1) {
    //     room.amountOfUsers = room.amountOfUsers - 2;
    //     console.log("0>", room.roomTopic, room.amountOfUsers);
    //   } else if (room && room.amountOfUsers === 0) {
    //     // room.mentorId = '';
    //     console.log("number", room.roomTopic, room.amountOfUsers);
    //   } else if (room && room.amountOfUsers === 1) {
    //     room.amountOfUsers = room.amountOfUsers - 1;
    //   }
    });
  });
};
