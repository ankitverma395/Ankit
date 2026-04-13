// import { Server } from 'socket.io';

// let io; // global instance

// // ✅ Initialize socket – attaches events to the existing io instance
// export const initIo = (ioInstance) => {
//   io = ioInstance;

//   io.on('connection', (socket) => {
//     console.log('🔌 User connected:', socket.id);

//     socket.on('join-chat', (songId) => {
//       socket.join(`song-${songId}`);
//     });

//     socket.on('join-user', (userId) => {
//       socket.join(`user-${userId}`);
//     });

//     socket.on('send-message', (data) => {
//       io.to(`song-${data.songId}`).emit('new-message', data);
//     });

//     socket.on('disconnect', () => {
//       console.log('❌ User disconnected:', socket.id);
//     });
//   });

//   return io;
// };

// // ✅ Get socket anywhere
// export const getIo = () => {
//   if (!io) {
//     throw new Error("❌ Socket.io not initialized");
//   }
//   return io;
// };


import { Server } from 'socket.io';

let io; // global instance

// ✅ Initialize socket
export const initIo = (ioInstance) => {
  io = ioInstance;

  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // ✅ Join song chat room
    socket.on('join-chat', (songId) => {
      if (!songId) return;
      socket.join(`song-${songId}`);
    });

    // ✅ Join user room
    socket.on('join-user', (userId) => {
      if (!userId) return;
      socket.join(`user-${userId}`);
    });

    // ✅ Send message to room
    socket.on('send-message', (data) => {
      if (!data?.songId) return;

      io.to(`song-${data.songId}`).emit('new-message', data);
    });

    // ✅ Disconnect
    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
    });
  });

  return io;
};

// ✅ Get socket instance anywhere
export const getIo = () => {
  if (!io) {
    throw new Error("❌ Socket.io not initialized");
  }
  return io;
};