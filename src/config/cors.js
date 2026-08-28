// split comma-separated origins from env
const parseOrigins = () => {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) return [];
  return raw.split(',').map((origin) => origin.trim()).filter(Boolean);
};

const corsOptions = {
  credentials: true, // lets browser send auth headers cross-origin
  origin(origin, callback) {
    const allowedOrigins = parseOrigins();

    // dev without env set — allow everything
    if (process.env.NODE_ENV !== 'production' && allowedOrigins.length === 0) {
      return callback(null, true);
    }

    // no origin (postman etc) or origin is on the list then allow
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // unknown origin case then block
    callback(null, false);
  },
};

module.exports = corsOptions;
