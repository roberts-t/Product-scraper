require('dotenv').config();
import express, { Express } from 'express';
import logger from './src/helpers/logger.helper';
const mongoose = require('mongoose');
const routes = require('./src/routes/router');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const scheduleService = require('./src/services/schedule.service');

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app: Express = express();
const port: number = Number(process.env.PORT) || 3000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200,
    credentials: true,
}));

app.use(express.static('public'));

app.use('/api', routes);

app.listen(port, async () => {
    logger.info(`Server is running on PORT ${port}, ENV: ${process.env.NODE_ENV}`);

    if (process.env.NODE_ENV != "DEV") {
        await scheduleService.scheduleSitesCrawl();
    }
});