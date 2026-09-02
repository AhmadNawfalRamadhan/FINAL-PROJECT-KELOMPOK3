module.exports = function startHandler(bot) {
  if (!bot) return;

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(
      chatId,
      [
        'Bot Admin Rasa Nusa aktif.',
        '',
        '/stok - melihat stok menu',
        '/chatid - melihat Chat ID Telegram',
        '',
        'Bot akan menerima notifikasi otomatis ketika ada pesanan baru.',
      ].join('\n')
    );
  });

  bot.onText(/\/chatid/, async (msg) => {
    await bot.sendMessage(msg.chat.id, `Telegram Chat ID:\n${msg.chat.id}`);
  });
};
