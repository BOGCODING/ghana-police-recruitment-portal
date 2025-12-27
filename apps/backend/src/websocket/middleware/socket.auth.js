const jwt = require('../../config/jwt');
const { Admin, Applicant } = require('../../models');

const socketAuth = async (socket, next) => {
  try {
    // 1. Try socket.handshake.auth.token
    // 2. Try Authorization header
    // 3. Try cookies (for HttpOnly session support)
    let token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
    
    if (!token && socket.handshake.headers.cookie) {
      const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
      }, {});
      
      token = cookies.adminAccessToken || cookies.accessToken;
    }

    if (!token) {
      console.warn('Socket Auth Warning: No token found in auth, headers, or cookies');
      return next(new Error('Authentication error: Token missing'));
    }

    const decoded = jwt.verifyAccessToken(token);
    let user;

    if (decoded.type === 'admin') {
      user = await Admin.findById(decoded.id);
    } else {
      user = await Applicant.findById(decoded.id);
    }

    if (!user) {
      console.error(`Socket Auth Failed: User not found for ID ${decoded.id}`);
      return next(new Error('Authentication error: User not found'));
    }

    socket.user = { id: user.id, type: decoded.type, role: user.role };
    next();
  } catch (err) {
    console.error('Socket Auth Error:', err.message);
    next(new Error('Authentication error: Invalid token'));
  }
};

module.exports = socketAuth;
