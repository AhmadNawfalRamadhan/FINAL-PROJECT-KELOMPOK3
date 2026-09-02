const { MenuItem } = require('../../models');

const rupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

module.exports = function stokHandler(bot) {
  if (!bot) return;

  bot.onText(/\/stok/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      const menus = await MenuItem.findAll({ order: [['name', 'ASC']] });

      if (!menus.length) {
        return bot.sendMessage(chatId, 'Belum ada data menu.');
      }

      const message = [
        'STOK MENU RASA NUSA',
        '',
        ...menus.map(
          (menu) => `${menu.name}\nHarga: ${rupiah(menu.price)}\nStok: ${menu.stock}`
        ),
      ].join('\n\n');

      await bot.sendMessage(chatId, message);
    } catch (error) {
      console.error('Gagal mengambil stok:', error.message);
      await bot.sendMessage(chatId, 'Gagal mengambil data stok.');
    }
  });
};
