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
    const ip = socket.handshake.address;
    console.log("ipAddress", ip);
    if((room?.clientConnect.findIndex((e) =>e===ip)) === -1)
    room?.clientConnect.push(ip);
    // send the ip address to the client:
    socket.emit("ip-address", ip);

    socket.on("specific-room", (topic: string) => {
      // const room = rooms.find((r) => r.roomTopic === socket.handshake.query.roomTopic);
      socket.join(topic);
      if (room) {
        if (room.clientConnect[0] === ip) {
          room.mentorId = ip;
        }
        socket.emit("send-code", room.roomCode);
        socket.emit("mentor-id", room.mentorId);
        room.amountOfUsers = room.amountOfUsers + 1;
        console.log("++1", room.roomTopic, room.amountOfUsers);
      }
    });

    socket.on("not-mentor", () => {
      // const room = rooms.find((r) => r.roomTopic === socket.handshake.query.roomTopic);
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
    })

    socket.on("user-typing", (code: string, topic: string) => {
      // const room = rooms.find((r) => r.roomTopic === socket.handshake.query.roomTopic);
      if (room) {
        room.roomCode = code.split("\n");
        socket.to(topic).emit("send-code", room.roomCode);
      }
    });

    socket.on("disconnect", () => {
      // const room = rooms.find((r) => r.roomTopic === socket.handshake.query.roomTopic);
      if(room){
        const ipIndex = room.clientConnect.findIndex((e)=> e===ip)

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
