const bot = require('../config/telegram');
const startHandler = require('./handlers/start.handler');
const stokHandler = require('./handlers/stok.handler');

let handlersRegistered = false;

function startBot() {
  if (!bot) {
    console.log('Bot Telegram tidak dijalankan karena token belum tersedia.');
    return;
  }

  if (!handlersRegistered) {
    startHandler(bot);
    stokHandler(bot);
    handlersRegistered = true;
  }

  bot.on('polling_error', (error) => {
    console.error('Telegram polling error:', error.message);
  });

  if (!bot.isPolling()) bot.startPolling();

  console.log('Bot Telegram aktif menggunakan long polling.');
}

async function sendOrderNotification(order) {
  if (!bot || !process.env.TELEGRAM_CHAT_ID) return;

  const items = order.items || [];
  const itemText = items
    .map((item) => {
      const name = item.name || item.menuItem?.name || 'Menu';
      return `• ${name} x${item.quantity} = Rp${Number(item.subtotal || 0).toLocaleString('id-ID')}`;
    })
    .join('\n');

  const message = [
    'PESANAN BARU',
    '',
    `Invoice: ${order.orderNumber}`,
    `Nama: ${order.customerName}`,
    `Sumber: ${order.source || 'website'}`,
    '',
    itemText || 'Detail item tidak tersedia',
    '',
    `Total: Rp${Number(order.totalPrice || 0).toLocaleString('id-ID')}`,
    `Status: ${order.status || 'menunggu'}`,
  ].join('\n');

  try {
    await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
    console.log(`Notifikasi Telegram terkirim: ${order.orderNumber}`);
  } catch (error) {
    console.error('Gagal mengirim notifikasi Telegram:', error.message);
  }
}

module.exports = { startBot, sendOrderNotification };
