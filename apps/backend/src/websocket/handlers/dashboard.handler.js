module.exports = (io, socket) => {
  if (socket.user.type === 'admin') {
    socket.join('admin:dashboard');
    console.log('Admin joined dashboard room');
  }
};
