module.exports = (io, socket) => {
  socket.on('application:subscribe', (appId) => {
    socket.join(`application:${appId}`);
  });
};
