const {
  Order,
  OrderItem,
  MenuItem,
} = require('../models');

const {
  createOrder,
} = require('../services/order.service');


exports.create = async (req, res) => {
  try {
    const order = await createOrder(
      req.body.customerName,
      req.body.items || [],
      req.body.source || 'cart'
    );

    res.status(201).json({
      message: 'Pesanan berhasil dibuat.',
      order,
    });

  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};


exports.list = async (_, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: MenuItem,
              as: 'menuItem',
            },
          ],
        },
      ],
      order: [
        ['createdAt', 'DESC'],
      ],
    });

    res.json(orders);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        'Gagal mengambil daftar pesanan.',
    });
  }
};


exports.detail = async (req, res) => {
  try {
    const order = await Order.findByPk(
      req.params.id,
      {
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: MenuItem,
                as: 'menuItem',
              },
            ],
          },
        ],
      }
    );

    if (!order) {
      return res.status(404).json({
        message:
          'Order tidak ditemukan.',
      });
    }

    res.json(order);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        'Gagal mengambil invoice.',
    });
  }
};


/*
|--------------------------------------------------------------------------
| TRACK ORDER CUSTOMER
|--------------------------------------------------------------------------
| Digunakan customer tanpa login.
| Customer cukup memasukkan nomor invoice/order.
|--------------------------------------------------------------------------
*/

exports.track = async (req, res) => {
  try {
    const orderNumber =
      req.params.orderNumber;

    const order = await Order.findOne({
      where: {
        orderNumber,
      },

      include: [
        {
          model: OrderItem,
          as: 'items',

          include: [
            {
              model: MenuItem,
              as: 'menuItem',
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        message:
          'Pesanan tidak ditemukan.',
      });
    }

    res.json({
      orderNumber:
        order.orderNumber,

      customerName:
        order.customerName,

      status:
        order.status,

      totalPrice:
        order.totalPrice,

      source:
        order.source,

      createdAt:
        order.createdAt,

      items:
        order.items,
    });

  } catch (error) {
    console.error(
      'Track order error:',
      error
    );

    res.status(500).json({
      message:
        'Gagal mengecek status pesanan.',
    });
  }
};


exports.updateStatus = async (req, res) => {
  try {
    const allowed = [
      'menunggu',
      'diproses',
      'selesai',
      'dibatalkan',
    ];

    if (
      !allowed.includes(
        req.body.status
      )
    ) {
      return res.status(400).json({
        message:
          'Status tidak valid.',
      });
    }

    const order =
      await Order.findByPk(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        message:
          'Order tidak ditemukan.',
      });
    }

    await order.update({
      status:
        req.body.status,
    });

    res.json({
      message:
        'Status pesanan berhasil diperbarui.',
      order,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        'Gagal mengubah status pesanan.',
    });
  }
};


exports.delete = async (req, res) => {
  try {
    const order =
      await Order.findByPk(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        message:
          'Order tidak ditemukan.',
      });
    }

    await OrderItem.destroy({
      where: {
        orderId:
          order.id,
      },
    });

    await order.destroy();

    res.json({
      message:
        'Invoice berhasil dihapus.',
    });

  } catch (error) {
    console.error(
      'Delete order error:',
      error
    );

    res.status(500).json({
      message:
        'Gagal menghapus invoice.',
    });
  }
};