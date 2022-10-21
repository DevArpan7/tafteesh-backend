const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, json, prettyPrint } = format;

const myFormat = printf(({ level, message, label, timestamp, ...metadata }) => {
    return `[${timestamp}] ${level}:` + JSON.stringify(message);
  });

const infoLogger = (data) => {
    return createLogger({
        level: 'debug',
        format: combine(
            timestamp({format:'DD-MMM-YYYY HH:mm:ss a'}),
            label({label: data}),
            myFormat
        ),
    
        defaultMeta: { 
            apiBase: "https://kamo-api.herokuapp.com",
        },
        transports: [
            // new transports.Console(),
            new transports.File({
                name: 'file#info',
                level: 'info',
                filename: 'info.log'
            }),
            // new transports.File({
            //     name: 'file#warn',
            //     level: 'warn',
            //     filename: 'warn.log'
            // }),
            // new transports.File({
            //     name: 'file#debug',
            //     level: 'debug',
            //     filename: 'debug.log'
            // }),
            // new transports.File({
            //     name: 'file#error',
            //     level: 'error',
            //     filename: 'errors.log'
            // })
        ],
    });
}

module.exports = infoLogger;