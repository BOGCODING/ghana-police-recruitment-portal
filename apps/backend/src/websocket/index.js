const { Server } = require('socket.io');
const socketAuth = require('./middleware/socket.auth');
const notificationHandler = require('./handlers/notification.handler');
const applicationHandler = require('./handlers/application.handler');
const dashboardHandler = require('./handlers/dashboard.handler');

let io;

const setupSocketHandlers = (instance) => {
  instance.use(socketAuth);

  instance.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user?.id || 'unknown'})`);

    // Automatically join a personal room for targeted emits
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
      console.log(`User ${socket.user.id} joined personal room user:${socket.user.id}`);
    }

    notificationHandler(instance, socket);
    applicationHandler(instance, socket);
    dashboardHandler(instance, socket);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

const initializeWebSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        process.env.ADMIN_URL || 'http://localhost:3002'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  setupSocketHandlers(io);
  return io;
};

/**
 * Emit event to a specific user (admin or applicant)
 * @param {string} userId 
 * @param {string} event 
 * @param {any} data 
 */
const emitToUser = (userId, event, data) => {
  if (!io) return;
  // Users join a room with their ID upon connection/auth
  io.to(`user:${userId}`).emit(event, data);
  io.to(`application:${userId}`).emit(event, data); // For backward compatibility with some rooms
};

/**
 * Emit to all admins
 */
const emitApplicationUpdate = (data) => {
  if (!io) return;
  io.emit('application:update', data);
};

/**
 * Emit to all admins in the dashboard room
 */
const emitDashboardRefresh = () => {
  if (!io) return;
  io.to('admin:dashboard').emit('stats:refresh');
};

module.exports = { 
  initializeWebSocket,
  emitToUser,
  emitApplicationUpdate,
  emitDashboardRefresh
};
