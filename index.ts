require('dotenv').config();
import express, { Express, Request, Response } from 'express';
import logger from './src/helpers/logger.helper';
const mongoose = require('mongoose');
const routes = require('./src/routes/router');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
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

// Include ReactJS build
if (process.env.NODE_ENV != "DEV") {
    app.use(express.static(path.join(__dirname, '../build')));
    app.get("*", (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, "../build", "index.html"), err => {
            if (err) {
                logger.error(`Failed to send index.html: ${err}`);
                return res.send(500);
            }
        });
    });
}

app.listen(port, async () => {
    logger.info(`Server is running on PORT ${port}, ENV: ${process.env.NODE_ENV}`);

    if (process.env.NODE_ENV != "DEV") {
        await scheduleService.scheduleSitesCrawl();
    }
});