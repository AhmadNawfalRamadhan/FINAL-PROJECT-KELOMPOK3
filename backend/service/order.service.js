const { Order, OrderItem, MenuItem, sequelize } = require('../models');
const { sendOrderNotification } = require('../bot/bot');

function generateOrderNumber() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const suffix = `${Date.now()}`.slice(-5);
  return `INV-${date}-${suffix}`;
}

async function createOrder(customerName, rawItems, source = 'cart') {
  if (!customerName?.trim()) throw new Error('Nama pemesan wajib diisi.');
  if (!Array.isArray(rawItems) || !rawItems.length) throw new Error('Pesanan tidak boleh kosong.');

  const result = await sequelize.transaction(async (transaction) => {
    const normalized = [];

    for (const rawItem of rawItems) {
      const menuItemId = Number(rawItem.menuItemId || rawItem.menuId);
      const quantity = Number(rawItem.quantity || 0);

      if (!menuItemId || quantity < 1) throw new Error('Data item pesanan tidak valid.');

      const menu = await MenuItem.findByPk(menuItemId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!menu) throw new Error(`Menu ID ${menuItemId} tidak ditemukan.`);
      if (menu.isAvailable === false) throw new Error(`${menu.name} sedang tidak tersedia.`);
      if (Number(menu.stock) < quantity) throw new Error(`Stok ${menu.name} tidak mencukupi.`);

      const price = Number(menu.price);
      normalized.push({
        menu,
        menuItemId: menu.id,
        name: menu.name,
        quantity,
        price,
        subtotal: price * quantity,
      });
    }

    const totalPrice = normalized.reduce((sum, item) => sum + item.subtotal, 0);

    const order = await Order.create(
      {
        orderNumber: generateOrderNumber(),
        customerName: customerName.trim(),
        totalPrice,
        status: 'menunggu',
        source,
      },
      { transaction }
    );

    for (const item of normalized) {
      await OrderItem.create(
        {
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        },
        { transaction }
      );

      item.menu.stock = Number(item.menu.stock) - item.quantity;
      await item.menu.save({ transaction });
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      invoiceNumber: order.orderNumber,
      customerName: order.customerName,
      totalPrice: order.totalPrice,
      status: order.status,
      source: order.source,
      createdAt: order.createdAt,
      items: normalized.map(({ menuItemId, name, quantity, price, subtotal }) => ({
        menuItemId,
        name,
        quantity,
        price,
        subtotal,
      })),
    };
  });

  // Notifikasi tidak boleh menggagalkan transaksi jika Telegram sedang bermasalah.
  sendOrderNotification(result).catch((error) =>
    console.error('Telegram notification error:', error.message)
  );

  return result;
}

module.exports = { createOrder };
