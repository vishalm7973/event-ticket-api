const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const corsOptions = require('./config/cors');
const routes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

app.use(helmet());

app.use(cors(corsOptions));

app.use(express.json());
app.use('/api', routes);
app.use(notFound);
app.use(errorMiddleware);

module.exports = app;
