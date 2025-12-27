const { query } = require('../../config/database');
const logger = require('../../utils/logger');

module.exports = (io, socket) => {
  socket.on('notification:subscribe', () => {
    socket.join(`notifications:${socket.user.id}`);
    console.log(`User ${socket.user.id} joined notification room`);
  });

  socket.on('notification:mark_read', async (data) => {
    try {
      const { notificationId } = data;
      if (!notificationId) return;

      await query(
        `UPDATE notifications 
         SET "isRead" = true, "readAt" = NOW() 
         WHERE id = $1 AND "userId" = $2`,
        [notificationId, socket.user.id]
      );
    } catch (error) {
      logger.error('Socket mark_read error:', error);
    }
  });
};
