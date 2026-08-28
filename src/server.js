const loadAndValidateEnv = require('./config/env');

try {
  loadAndValidateEnv();
} catch (err) {
  console.error('Failed to start server:', err.message);
  process.exit(1);
}

const app = require('./app');
const connectDB = require('./config/db');

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
