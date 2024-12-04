import { io } from "../../server";
import { Server, Socket } from "socket.io";

 const sendNotification= (userId:string, payload:any)=>{
    try {
        io.to(userId).emit("receiveNotification", payload);
    } catch (error) {
        console.log(error);
    }
}

const handleJoinRoom = (socket: Socket, userId: string) => {
    socket.join(userId); // Join the user to a room with their user ID
    socket.emit("message", `You have joined the room: ${userId}`); // Emit a message back to the user
  };
  


  const initializeSocketEvents = (socket: Socket) => {
    socket.on("joinRoom", (userId: string) => {
      handleJoinRoom(socket, userId);
    });
// Event for disconnecting the user (optional but useful for clean-up)
    socket.on("disconnect", () => {
    });
  };

  export { initializeSocketEvents, sendNotification };
 