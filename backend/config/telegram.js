const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;

let bot = null;

if (token) {
  bot = new TelegramBot(token, { polling: false });
} else {
  console.warn('TELEGRAM_BOT_TOKEN belum diisi. Bot Telegram tidak dijalankan.');
}

module.exports = bot;
