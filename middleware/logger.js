const winston = require('winston');
require('winston-daily-rotate-file');
const axios = require('axios');
const path = require('node:path');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1002666317450';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const getTimestamp = () =>
  new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace('T', ' ');

const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

const transportCombined = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, '../logs', 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: IS_PRODUCTION ? 'warn' : 'info',
  format: winston.format.combine(winston.format.timestamp({ format: getTimestamp }), logFormat),
});

const transportError = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, '../logs', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '30d',
  level: 'error',
  format: winston.format.combine(winston.format.timestamp({ format: getTimestamp }), logFormat),
});

const transports = [transportError, transportCombined];

if (!IS_PRODUCTION) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: getTimestamp }),
        logFormat
      ),
    })
  );
}

const logger = winston.createLogger({
  level: IS_PRODUCTION ? 'warn' : 'info',
  transports,
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '../logs', 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '30d',
    }),
  ],
});

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};
const HTML_ESCAPE_REGEX = /[&<>"']/g;

function escapeHTML(text) {
  return String(text).replace(HTML_ESCAPE_REGEX, (ch) => HTML_ESCAPE_MAP[ch]);
}

function formatLogHTML(level, message) {
  const timestamp = getTimestamp();
  const emojiMap = { error: '🚨', warn: '⚠️', info: '✅', debug: '🐛' };
  const emoji = emojiMap[level] || '🔔';

  return `${emoji} <b>Level:</b> <code>${level.toUpperCase()}</code>\n🕒 <b>Time:</b> <i>${timestamp}</i>\nMessage:\n<pre>${escapeHTML(message)}</pre>`.trim();
}

let telegramTimeout = null;
const pendingMessages = [];

const telegramAxios = TELEGRAM_TOKEN
  ? axios.create({
      baseURL: `https://api.telegram.org/bot${TELEGRAM_TOKEN}`,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    })
  : null;

function sendToTelegram(level, message) {
  pendingMessages.push(formatLogHTML(level, message));

  if (telegramTimeout) return;

  telegramTimeout = setTimeout(async () => {
    const batch = pendingMessages.splice(0, pendingMessages.length);
    telegramTimeout = null;

    if (batch.length === 0) return;

    const combined = batch.join('\n\n───────────────────\n\n');
    const truncated =
      combined.length > 4000 ? `${combined.slice(0, 4000)}\n...[truncated]` : combined;

    try {
      await telegramAxios.post('/sendMessage', {
        chat_id: TELEGRAM_CHAT_ID,
        text: truncated,
        parse_mode: 'HTML',
      });
    } catch (err) {
      logger.error(`[Logger] Gagal kirim ke Telegram: ${err.message}`);
    }
  }, 3000);

  if (telegramTimeout?.unref) telegramTimeout.unref();
}

function logMessage(level, message) {
  logger.log({ level, message });

  if (level === 'error' && telegramAxios) {
    sendToTelegram(level, message);
  }
}

module.exports = { logger, logMessage };
