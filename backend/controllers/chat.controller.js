const { MenuItem } = require('../models');

const {
  interpretMessage,
} = require('../services/ai.service');

const {
  createOrder,
} = require('../services/order.service');


function basicFallback(message, menus) {
  const q = message.toLowerCase();

  const matched = menus.filter((menu) =>
    q.includes(
      menu.name.toLowerCase()
    )
  );

  if (matched.length) {
    return {
      intent: 'question',

      reply: matched
        .map(
          (menu) =>
            `${menu.name} — Rp${Number(
              menu.price
            ).toLocaleString('id-ID')}. ${
              menu.description || ''
            }`
        )
        .join('\n'),

      items: [],
    };
  }

  if (
    /rekomendasi|saran|pedas|manis/.test(q)
  ) {
    const picks = menus
      .filter(
        (menu) =>
          menu.stock > 0 &&
          menu.isAvailable
      )
      .slice(0, 3);

    return {
      intent: 'recommendation',

      reply:
        `Coba ${picks
          .map((menu) => menu.name)
          .join(', ')}. ` +
        `Semuanya tersedia dari data menu restoran.`,

      items: [],
    };
  }

  return {
    intent: 'other',

    reply:
      'Aku belum yakin maksudnya. Kamu bisa tanya harga, bahan, minta rekomendasi, atau pesan menu dengan kalimat seperti "pesan nasi goreng 2 dan es teh 1".',

    items: [],
  };
}


exports.message = async (req, res) => {
  try {
    const message =
      req.body.message || '';

    const menus =
      await MenuItem.findAll({
        where: {
          isAvailable: true,
        },
      });

    let result;

    try {
      result =
        await interpretMessage(
          message,
          menus
        );
    } catch (error) {
      console.error(
        'AI interpret error:',
        error.message
      );
    }

    if (!result) {
      result =
        basicFallback(
          message,
          menus
        );
    }

    if (
      result.intent === 'order' &&
      result.items?.length
    ) {
      const detailed = [];

      for (const item of result.items) {
        const menu = menus.find(
          (menu) =>
            menu.id ===
            Number(
              item.menuItemId
            )
        );

        if (!menu) {
          return res.json({
            intent:
              'clarification',

            reply:
              'Ada menu yang belum berhasil dikenali. Bisa sebutkan nama menu dengan lebih jelas?',

            requiresConfirmation:
              false,

            items: [],
          });
        }

        const quantity =
          Math.max(
            1,
            Number(
              item.quantity || 1
            )
          );

        if (
          !Number.isFinite(
            quantity
          )
        ) {
          return res.json({
            intent:
              'clarification',

            reply:
              `Jumlah untuk ${menu.name} belum jelas. Mau pesan berapa?`,

            requiresConfirmation:
              false,

            items: [],
          });
        }

        if (
          menu.stock <= 0
        ) {
          return res.json({
            intent:
              'clarification',

            reply:
              `${menu.name} sedang habis.`,

            requiresConfirmation:
              false,

            items: [],
          });
        }

        if (
          quantity >
          menu.stock
        ) {
          return res.json({
            intent:
              'clarification',

            reply:
              `Stok ${menu.name} saat ini hanya ${menu.stock}. ` +
              `Kamu meminta ${quantity}. ` +
              `Mau pesan ${menu.stock} atau kurang?`,

            requiresConfirmation:
              false,

            items: [],
          });
        }

        detailed.push({
          menuItemId:
            menu.id,

          name:
            menu.name,

          quantity,

          price:
            Number(
              menu.price
            ),

          subtotal:
            Number(
              menu.price
            ) * quantity,
        });
      }

      if (!detailed.length) {
        return res.json({
          intent:
            'clarification',

          reply:
            'Aku belum berhasil mengenali menu yang ingin dipesan. Bisa sebutkan nama menu dan jumlahnya lagi?',

          requiresConfirmation:
            false,

          items: [],
        });
      }

      return res.json({
        ...result,

        requiresConfirmation:
          true,

        items:
          detailed,

        total:
          detailed.reduce(
            (
              sum,
              item
            ) =>
              sum +
              item.subtotal,
            0
          ),
      });
    }

    return res.json(result);
  } catch (error) {
    console.error(
      'Chat message error:',
      error
    );

    return res.status(500).json({
      message:
        'Gagal memproses pesan.',
    });
  }
};


exports.confirm = async (
  req,
  res
) => {
  try {
    const order =
      await createOrder(
        req.body.customerName,
        req.body.items || [],
        'chat'
      );

    res.status(201).json({
      message:
        'Pesanan berhasil dibuat.',

      order,
    });
  } catch (error) {
    res.status(400).json({
      message:
        error.message,
    });
  }
};