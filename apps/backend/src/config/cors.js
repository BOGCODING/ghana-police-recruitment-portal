const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.CORS_ORIGIN || '')
      .split(',')
      .map(o => o.trim().replace(/[`"']/g, '')) // Remove backticks, single/double quotes
      .filter(Boolean);
    
    // Allow requests with no origin (mobile apps, scripts, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Default local origins for development
    const localOrigins = [
      'http://localhost:3000', 
      'http://localhost:3002', 
      'http://127.0.0.1:3000', 
      'http://127.0.0.1:3002',
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL
    ].filter(Boolean);

    const isAllowed = 
      allowedOrigins.includes('*') || 
      allowedOrigins.includes(origin) || 
      localOrigins.includes(origin) || 
      process.env.NODE_ENV === 'development';

    if (isAllowed) {
      callback(null, true);
    } else {
      // LOG THE FAILURE SO WE CAN SEE IT IN RENDER DASHBOARD
      console.warn('[CORS] Request blocked from origin: ' + origin);
      console.warn('[CORS] Allowed by Config:', allowedOrigins);
      // NEVER throw an error here, it causes 500 which strips CORS headers
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'Content-Disposition'],
  maxAge: 86400, // 24 hours
};

module.exports = { corsOptions };
