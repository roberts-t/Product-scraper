const winston = require('winston');
require('winston-mongodb');

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'white',
};

const level = () => {
    const isDev = process.env.NODE_ENV == "DEV";
    return isDev ? 'debug' : 'warn';
};

winston.addColors(colors);

const format = winston.format.combine(
    winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info: { timestamp: string; level: string; message: string; }) =>
            `${info.timestamp} [${info.level}]: ${info.message}`,
    ),
);

const devTransports = [
    new winston.transports.Console({
        handleExceptions: true,
    }),
];

const prodTransports = [
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        colorize: false,
        handleExceptions: true,
    }),
    new winston.transports.MongoDB({
        db: process.env.MONGO_URI,
        collection: 'logs',
        decolorize: true,
        handleExceptions: true,
        // Expire logs after 3 days
        expireAfterSeconds: 3 * 24 * 60 * 60,
    }),
]


export default winston.createLogger({
    level: level(),
    levels,
    format,
    transports: process.env.NODE_ENV == "DEV" ? devTransports : prodTransports,
});
