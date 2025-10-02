import { createLogger, format, transports } from 'winston';
import * as dayjs from 'dayjs';
import * as jalaliday from 'dayjs/plugin/jalaliUtc';

dayjs.extend(jalaliday);

const { combine, timestamp, printf } = format;

const persianFormat = printf(({ level, message, timestamp }) => {
  const jalaliDate = dayjs(timestamp)
    .calendar('jalali')
    .locale('fa')
    .format('YYYY/MM/DD HH:mm:ss');

  return `[${jalaliDate}] ${level}: ${message}`
    .replace(/(\d+)/g, (num) => 
      new Intl.NumberFormat('fa-IR').format(parseInt(num))
    );
});

export const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    persianFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024 // 10MB
    }),
    new transports.Http({
      host: 'monitoring.example.com',
      port: 443,
      path: '/api/v1/logs',
      ssl: true,
      timeout: 3000,
      reconnect: true,
      maxRetries: 3
    })
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' }),
    new transports.File({
      filename: 'logs/fallback.log',
      handleRejections: true
    })
  ]
});