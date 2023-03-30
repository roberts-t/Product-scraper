require('dotenv').config();
import express, { Express } from 'express';
const logger = require('./src/helpers/logger.helper');
const mongoose = require('mongoose');
const routes = require('./src/routes/router');
const cors = require('cors');

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app: Express = express();
const port: number = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200
}));

app.use(express.static('public'));

app.use('/api', routes);

app.listen(port, () => {
    logger.info(`Server is running on PORT ${port}, ENV: ${process.env.NODE_ENV}`);
});