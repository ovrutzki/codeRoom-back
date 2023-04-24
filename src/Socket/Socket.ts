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

// take room data from data base when the server run
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
// create the socket connection
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

    // if the client not in the list of the client insert him:
    if((room?.clientConnect.findIndex((e) =>e===ip)) === -1)
    room?.clientConnect.push(ip);
    
    // send the ip address to the client:
    socket.emit("ip-address", ip);

    // join a specific room when enter to it`s page:
    socket.on("specific-room", (topic: string) => {
      socket.join(topic);
      if (room) {
        if (room.clientConnect[0] === ip) {
          room.mentorId = ip;
          
        }
        // send to the user the code from the data base and the ip of the mentor:
        socket.emit("send-code", room.roomCode, 'DataBase');
        socket.emit("mentor-id", room.mentorId);
        room.amountOfUsers = room.amountOfUsers + 1;
      }
    });

    // when "im not a mentor" clicked - reset the mentorId value
    socket.on("not-mentor", () => {
      if (room) {
        room.mentorId = "";
        room.amountOfUsers = 0;
        const clientId = room.clientConnect.shift()
        clientId && room.clientConnect.push(clientId)
      }
    });
        // when "im a mentor" clicked - make the user mentor and if there is another mentor -> make him a user
    socket.on('is-mentor', ()=>{
        if(room){
            const ipIndex = room.clientConnect.findIndex((e)=> e===ip);
            const clientId = room.clientConnect.splice(ipIndex,1)[0];
            room.clientConnect.unshift(clientId)
        }
        socket.to(room?.roomTopic).emit('not-mentor')
    })

// get what the user is typing and send it to the users in the specific room:
    socket.on("user-typing", (code: string[],userName:string ,topic: string) => {
      if (room) {
        room.roomCode = code;
        socket.broadcast.to(topic).emit("send-code", code, userName);
      }
    });
// disconnect and delete user from user list
    socket.on("disconnect", () => {
      if(room){
        const ipIndex = room.clientConnect.findIndex((e)=> e===ip)        
        delete room.clientConnect[ipIndex]
      }
   
    });
  });
};
