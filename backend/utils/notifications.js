let ioInstance = null;

function setSocketIO(io) {
  ioInstance = io;
}

function emitNotification(userId, notification) {
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit('notification', notification);
  }
}

module.exports = { setSocketIO, emitNotification }; 