const { MenuItem } = require('../models');

async function seed() {
  try {
    const menus = [
      {
        name: 'Nasi Goreng Rempah',
        category: 'utama',
        price: 32000,
        stock: 30,
        ingredients: 'Nasi, telur, ayam, bawang, cabai, rempah',
        taste: 'Gurih, sedikit pedas',
        origin: 'Indonesia',
        description:
          'Nasi goreng signature dengan perpaduan rempah aromatik dan ayam.',
        image: null,
      },

      {
        name: 'Ayam Bakar Madu',
        category: 'utama',
        price: 38000,
        stock: 25,
        ingredients: 'Ayam, madu, kecap, bawang, rempah',
        taste: 'Manis gurih',
        origin: 'Indonesia',
        description:
          'Ayam bakar lembut dengan glaze madu dan bumbu khas Indonesia.',
        image: null,
      },

      {
        name: 'Rendang Sapi',
        category: 'utama',
        price: 45000,
        stock: 20,
        ingredients: 'Daging sapi, santan, cabai, serai, rempah',
        taste: 'Gurih, pedas, kaya rempah',
        origin: 'Sumatera Barat',
        description:
          'Rendang sapi dengan bumbu rempah yang dimasak hingga meresap.',
        image: null,
      },

      {
        name: 'Sate Ayam',
        category: 'utama',
        price: 35000,
        stock: 30,
        ingredients: 'Ayam, kacang, kecap, bawang, cabai',
        taste: 'Gurih manis',
        origin: 'Indonesia',
        description:
          'Sate ayam panggang dengan saus kacang dan kecap manis.',
        image: null,
      },

      {
        name: 'Mie Goreng Jawa',
        category: 'utama',
        price: 30000,
        stock: 30,
        ingredients: 'Mie, telur, ayam, sayuran, kecap',
        taste: 'Gurih manis',
        origin: 'Jawa',
        description:
          'Mie goreng Jawa dengan bumbu tradisional dan sayuran segar.',
        image: null,
      },

      {
        name: 'Soto Ayam',
        category: 'utama',
        price: 28000,
        stock: 25,
        ingredients: 'Ayam, bihun, kol, telur, kunyit, rempah',
        taste: 'Gurih segar',
        origin: 'Indonesia',
        description:
          'Soto ayam dengan kuah kuning rempah yang ringan dan hangat.',
        image: null,
      },

      {
        name: 'Es Teh Citrus',
        category: 'minuman',
        price: 14000,
        stock: 50,
        ingredients: 'Teh, lemon, jeruk, gula',
        taste: 'Segar, sedikit asam',
        origin: 'House Blend',
        description:
          'Es teh ringan dengan sentuhan lemon dan jeruk segar.',
        image: null,
      },

      {
        name: 'Es Kopi Gula Aren',
        category: 'minuman',
        price: 22000,
        stock: 40,
        ingredients: 'Espresso, susu, gula aren, es',
        taste: 'Manis, creamy, sedikit pahit',
        origin: 'Indonesia',
        description:
          'Kopi susu dingin dengan gula aren yang lembut.',
        image: null,
      },

      {
        name: 'Jus Mangga',
        category: 'minuman',
        price: 18000,
        stock: 35,
        ingredients: 'Mangga, air, gula, es',
        taste: 'Manis segar',
        origin: 'Indonesia',
        description:
          'Jus mangga segar dengan rasa buah yang kuat.',
        image: null,
      },

      {
        name: 'Wedang Jahe',
        category: 'minuman',
        price: 16000,
        stock: 30,
        ingredients: 'Jahe, gula merah, serai, air',
        taste: 'Hangat, manis, sedikit pedas',
        origin: 'Jawa',
        description:
          'Minuman jahe hangat dengan aroma serai dan gula merah.',
        image: null,
      },

      {
        name: 'Panna Cotta Gula Aren',
        category: 'dessert',
        price: 22000,
        stock: 20,
        ingredients: 'Susu, krim, gelatin, gula aren',
        taste: 'Manis lembut',
        origin: 'Fusion',
        description:
          'Dessert lembut dengan saus gula aren khas Indonesia.',
        image: null,
      },

      {
        name: 'Pisang Goreng Caramel',
        category: 'dessert',
        price: 20000,
        stock: 25,
        ingredients: 'Pisang, tepung, gula, caramel',
        taste: 'Manis, renyah',
        origin: 'Indonesia',
        description:
          'Pisang goreng renyah dengan saus caramel.',
        image: null,
      },
    ];

    for (const menu of menus) {
      const [item, created] = await MenuItem.findOrCreate({
        where: {
          name: menu.name,
        },
        defaults: menu,
      });

      if (created) {
        console.log(`Seed dibuat: ${item.name}`);
      } else {
        console.log(`Sudah ada: ${item.name}`);
      }
    }

    console.log('Seed menu selesai.');
  } catch (error) {
    console.error(
      'Gagal menjalankan seed menu:',
      error.message
    );

    throw error;
  }
}

module.exports = seed;