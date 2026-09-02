require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');

const {
  sequelize,
  Admin,
} = require('./models');

const { startBot } = require('./bot/bot');
const seedMenu = require('./seeders/seed');

const app = express();

const port = process.env.PORT || 3000;

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      'http://localhost:5173',

    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      'development-secret',

    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 86400000,
    },
  })
);

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
);

app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    message: 'Restaurant API ready',
  });
});

app.use(
  '/api/auth',
  require('./routes/auth.routes')
);

app.use(
  '/api/menus',
  require('./routes/menu.routes')
);

app.use(
  '/api/orders',
  require('./routes/order.routes')
);

app.use(
  '/api/chat',
  require('./routes/chat.routes')
);

/*
|--------------------------------------------------------------------------
| SEED ADMIN
|--------------------------------------------------------------------------
*/

async function seedAdmin() {
  const hash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD ||
      'admin12345',
    10
  );

  await Admin.findOrCreate({
    where: {
      email:
        process.env.ADMIN_EMAIL ||
        'admin@restaurant.local',
    },

    defaults: {
      name: 'Administrator',
      passwordHash: hash,
    },
  });

  console.log('Seed admin selesai.');
}

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

async function startServer() {
  try {
    await sequelize.authenticate();

    console.log(
      'Database berhasil terhubung'
    );

    await sequelize.sync({
      alter: true,
    });

    console.log(
      'Sinkronisasi database selesai'
    );

    await seedAdmin();

    await seedMenu();

    startBot();

    app.listen(port, () => {
      console.log(
        `Backend jalan di http://localhost:${port}`
      );
    });
  } catch (error) {
    console.error(
      'Gagal menjalankan backend:',
      error
    );

    process.exit(1);
  }
}

startServer();