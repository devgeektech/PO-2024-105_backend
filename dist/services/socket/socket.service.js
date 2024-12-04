"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.initializeSocketEvents = void 0;
const server_1 = require("../../server");
const sendNotification = (userId, payload) => {
    try {
        server_1.io.to(userId).emit("receiveNotification", payload);
    }
    catch (error) {
        console.log(error);
    }
};
exports.sendNotification = sendNotification;
const handleJoinRoom = (socket, userId) => {
    socket.join(userId); // Join the user to a room with their user ID
    socket.emit("message", `You have joined the room: ${userId}`); // Emit a message back to the user
};
const initializeSocketEvents = (socket) => {
    socket.on("joinRoom", (userId) => {
        handleJoinRoom(socket, userId);
    });
    // Event for disconnecting the user (optional but useful for clean-up)
    socket.on("disconnect", () => {
    });
};
exports.initializeSocketEvents = initializeSocketEvents;
//# sourceMappingURL=socket.service.js.map